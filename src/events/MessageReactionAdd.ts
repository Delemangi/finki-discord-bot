import { logErrorFunctions } from '../translations/logs.js';
import { getConfigProperty } from '../utils/config.js';
import { addExperience } from '../utils/experience.js';
import { logger } from '../utils/logger.js';
import { type ClientEvents, Events, type MessageReaction, type User } from 'discord.js';

export const name = Events.MessageReactionAdd;

async function removeKromidReaction(messageReaction: MessageReaction, _user: User) {
  if (messageReaction.message.author.id !== "206360333881704449") return;
  if (messageReaction.emoji == "🧅") await messageReaction.remove();
}

export const execute = async (...[messageReaction, user]: ClientEvents[typeof name]) => {
  await removeKromidReaction(messageReaction, user);
};
