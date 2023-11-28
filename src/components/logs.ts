import {
  fetchMessageUrl,
  getButtonCommand,
  getButtonInfo,
  getChannelMention,
} from "@app/components/utils.js";
import { getConfigProperty } from "@app/utils/config.js";
import { logEmbedStrings } from "@app/utils/strings.js";
import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  inlineCode,
  type UserContextMenuCommandInteraction,
  userMention,
} from "discord.js";

const color = await getConfigProperty("color");

export const getChatInputCommandEmbed = async (
  interaction: ChatInputCommandInteraction,
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(logEmbedStrings.chatInputInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        inline: true,
        name: logEmbedStrings.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: logEmbedStrings.channel,
        value: getChannelMention(interaction),
      },
      {
        inline: true,
        name: logEmbedStrings.command,
        value: inlineCode(
          interaction.toString().length > 300
            ? interaction.toString().slice(0, 300)
            : interaction.toString(),
        ),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};

export const getUserContextMenuCommandEmbed = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(logEmbedStrings.userContextMenuInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        name: logEmbedStrings.author,
        value: userMention(interaction.user.id),
      },
      {
        name: logEmbedStrings.channel,
        value: getChannelMention(interaction),
      },
      {
        name: logEmbedStrings.command,
        value: inlineCode(interaction.commandName),
      },
      {
        name: logEmbedStrings.target,
        value: userMention(interaction.targetUser.id),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};

export const getButtonEmbed = (
  interaction: ButtonInteraction,
  command: string = "unknown",
  args: string[] = [],
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(logEmbedStrings.buttonInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: logEmbedStrings.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: logEmbedStrings.channel,
        value: getChannelMention(interaction),
      },
      {
        inline: true,
        name: logEmbedStrings.command,
        value: getButtonCommand(command),
      },
      {
        inline: true,
        ...getButtonInfo(interaction, command, args),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};

export const getAutocompleteEmbed = (interaction: AutocompleteInteraction) => {
  const focused = interaction.options.getFocused(true);

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(logEmbedStrings.autocompleteInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: logEmbedStrings.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: logEmbedStrings.channel,
        value: getChannelMention(interaction),
      },
      {
        inline: true,
        name: logEmbedStrings.command,
        value: inlineCode(focused.name),
      },
      {
        inline: true,
        name: logEmbedStrings.value,
        value:
          focused.value === ""
            ? logEmbedStrings.empty
            : inlineCode(focused.value),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};
