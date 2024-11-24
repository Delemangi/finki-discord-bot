import { getReactionsProperty } from '../configuration/main.js';
import { logErrorFunctions } from '../translations/logs.js';
import { logger } from '../utils/logger.js';
import {
  type ClientEvents,
  Events,
  type MessageReaction,
  type PartialMessageReaction,
} from 'discord.js';

export const name = Events.MessageReactionAdd;

const removeReaction = async (
  reaction: MessageReaction | PartialMessageReaction,
) => {
  const emojis = await getReactionsProperty('remove');
  const authorId = reaction.message.author?.id;

  if (authorId === undefined) {
    return;
  }

  const emojiReaction = emojis?.[authorId];
  const reactedEmoji = reaction.emoji.name?.toLowerCase();

  if (
    emojiReaction === undefined ||
    reactedEmoji === undefined ||
    reactedEmoji !== emojiReaction
  ) {
    return;
  }

  try {
    await reaction.remove();
  } catch (error) {
    logger.error(logErrorFunctions.removeReactionError(error));
  }
};

export const execute = async (...[reaction]: ClientEvents[typeof name]) => {
  await removeReaction(reaction);
};
