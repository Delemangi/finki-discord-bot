import { type ClientEvents, Events, type Message } from 'discord.js';

import {
  getCrosspostingProperty,
  getReactionsProperty,
} from '../configuration/main.js';
import { logger } from '../logger.js';
import { logErrorFunctions } from '../translations/logs.js';
import { addExperience } from '../utils/experience.js';

export const name = Events.MessageCreate;

const crosspostingChannels = getCrosspostingProperty('channels');
const crosspostingEnabled = getCrosspostingProperty('enabled');

const crosspost = async (message: Message) => {
  if (
    !crosspostingEnabled ||
    crosspostingChannels?.length === 0 ||
    !crosspostingChannels?.includes(message.channel.id)
  ) {
    return;
  }

  try {
    await message.crosspost();
  } catch (error) {
    logger.error(logErrorFunctions.crosspostError(message.channel.id, error));
  }
};

const addReaction = async (message: Message) => {
  const reactions = getReactionsProperty('add');
  const authorId = message.author.id;
  const reaction = reactions?.[authorId];

  if (reaction === undefined) {
    return;
  }

  try {
    await message.react(reaction);
  } catch (error) {
    logger.error(logErrorFunctions.addReactionError(error));
  }
};

export const execute = async (...[message]: ClientEvents[typeof name]) => {
  await crosspost(message);
  await addExperience(message);
  await addReaction(message);
};
