import { getConfigProperty } from '../utils/config.js';
import {
  type ClientEvents,
  Events,
  type MessageReaction,
  type PartialMessageReaction,
} from 'discord.js';

export const name = Events.MessageReactionAdd;
const emojis = ['🧅', 'onion', ':onion:'];

const removeReaction = async (
  reaction: MessageReaction | PartialMessageReaction,
) => {
  const onions = await getConfigProperty('onions');
  const authorId = reaction.message.author?.id;
  const emojiName = reaction.emoji.name?.toLowerCase();

  if (
    emojiName === undefined ||
    authorId === undefined ||
    onions[authorId] !== 'remove' ||
    !emojis.includes(emojiName)
  ) {
    return;
  }

  await reaction.remove();
};

export const execute = async (...[reaction]: ClientEvents[typeof name]) => {
  await removeReaction(reaction);
};
