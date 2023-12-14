import { type BotConfig } from '../types/BotConfig.js';
import { logger } from '../utils/logger.js';
import { database } from './database.js';

export const getConfig = async () => {
  return await database.config.findFirst();
};

export const setConfig = async (config?: BotConfig) => {
  if (config === undefined) {
    return null;
  }

  try {
    return await database.config.upsert({
      create: {
        name: 'config',
        value: config,
      },
      update: {
        value: config,
      },
      where: {
        name: 'config',
      },
    });
  } catch (error) {
    logger.error(`Failed setting config\n${error}`);

    return null;
  }
};
