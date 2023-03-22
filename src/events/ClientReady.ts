import { initializeChannels } from '../utils/channels.js';
import { client } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { type ClientEvents, Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export const execute = async (...args: ClientEvents[typeof name]) => {
  initializeChannels();
  await args[0].application?.commands.fetch();
  logger.info(`Logged in as ${client.user?.tag}`);
  logger.info('Bot ready');
};
