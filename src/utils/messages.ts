import { labels } from "../translations/labels.js";
import { type ChatInputCommandInteraction, codeBlock } from "discord.js";

export const splitMessage = function* (message: string) {
  if (message === "") {
    yield "";

    return;
  }

  const delimiters = ["\n"];
  const length = 1_999;
  let output;
  let index = message.length;
  let split;
  let currentMessage = message;

  while (currentMessage) {
    if (currentMessage.length > length) {
      split = true;
      for (const char of delimiters) {
        index = currentMessage.slice(0, length).lastIndexOf(char) + 1;

        if (index) {
          split = false;
          break;
        }
      }

      if (split) {
        index = length;
      }

      output = currentMessage.slice(0, Math.max(0, index));
      currentMessage = currentMessage.slice(index);
    } else {
      output = currentMessage;
      currentMessage = "";
    }

    yield output;
  }
};

export const safeReplyToInteraction = async (
  interaction: ChatInputCommandInteraction,
  message: string,
  options?: {
    language?: string;
    mentionUsers?: boolean;
    useCodeBlock?: boolean;
  },
) => {
  const {
    language = "",
    mentionUsers = false,
    useCodeBlock = false,
  } = options ?? {};
  let reply = false;

  for (const output of splitMessage(message)) {
    const nextReply = useCodeBlock
      ? codeBlock(language, output.length === 0 ? labels.none : output)
      : output;

    if (reply) {
      await interaction.followUp({
        ...(!mentionUsers && {
          allowedMentions: {
            users: [],
          },
        }),
        content: nextReply,
      });
    } else if (interaction.deferred) {
      await interaction.editReply(nextReply);
    } else {
      await interaction.reply(nextReply);
    }

    reply = true;
  }
};
