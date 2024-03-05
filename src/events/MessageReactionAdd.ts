import {
  type ClientEvents,
  Events,
  type MessageReaction,
  type PartialMessageReaction,
} from 'discord.js';

export const name = Events.MessageReactionAdd;

const targetEmojis = ['🧅', 'onion', 'kromid'];

const removeKromidReaction = async (
  messageReaction: MessageReaction | PartialMessageReaction,
) => {
  const emojiName = messageReaction.emoji.name
    ? messageReaction.emoji.name.toLowerCase()
    : '';
  if (messageReaction.message?.author?.id !== '206360333881704449') return;
  if (!targetEmojis.includes(emojiName)) await messageReaction.remove();
};

export const execute = async (
  ...[messageReaction]: ClientEvents[typeof name]
) => {
  await removeKromidReaction(messageReaction);
};
