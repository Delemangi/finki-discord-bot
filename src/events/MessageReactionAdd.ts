import { getOnionsProperty } from '../utils/config.js';
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
  const mode = await getOnionsProperty('mode');

  if (mode !== 'remove') {
    return;
  }

  const emojiName = reaction.emoji.name?.toLowerCase();
  const authorId = reaction.message.author?.id;
  const users = await getOnionsProperty('users');

  if (
    emojiName === undefined ||
    authorId === undefined ||
    !users.includes(authorId) ||
    !emojis.includes(emojiName)
  ) {
    return;
  }

  await reaction.remove();
};

export const execute = async (...[reaction]: ClientEvents[typeof name]) => {
  await removeReaction(reaction);
};
