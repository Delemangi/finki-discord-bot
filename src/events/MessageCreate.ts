import { getFromBotConfig } from '../utils/config.js';
import { getCrossposting } from '../utils/crossposting.js';
import { logger } from '../utils/logger.js';
import { type ClientEvents, Events, type Message } from 'discord.js';

export const name = Events.MessageCreate;
const crosspostChannels = getFromBotConfig('crosspostChannels');

const crosspost = async (message: Message) => {
  if (
    !getCrossposting() ||
    crosspostChannels.length === 0 ||
    !crosspostChannels.includes(message.channel.id)
  ) {
    return;
  }

  try {
    await message.crosspost();
  } catch (error) {
    logger.error(
      `Failed to crosspost message by ${message.author.tag}\n${error}`,
    );
  }
};

export const execute = async (...args: ClientEvents[typeof name]) => {
  const message = args[0];

  await crosspost(message);
};
