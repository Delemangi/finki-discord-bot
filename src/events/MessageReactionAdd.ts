import { logErrorFunctions } from '../translations/logs.js';
import { getReactionsProperty } from '../utils/config.js';
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
  const onions = await getReactionsProperty('remove');
  const authorId = reaction.message.author?.id;

  if (authorId === undefined) {
    return;
  }

  const emoji = onions[authorId];
  const reactedEmoji = reaction.emoji.name?.toLowerCase();

  if (
    emoji === undefined ||
    reactedEmoji === undefined ||
    reactedEmoji !== emoji
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
