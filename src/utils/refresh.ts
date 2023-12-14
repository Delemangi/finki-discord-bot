import { logMessageFunctions } from '../translations/logs.js';
import { type BotConfig } from '../types/BotConfig.js';
import { initializeChannels } from './channels.js';
import { logger } from './logger.js';
import { initializeRoles } from './roles.js';

export const refreshOnConfigChange = async (property: keyof BotConfig) => {
  logger.info(`Config property ${property} changed, refreshing...`);

  switch (property) {
    case 'channels':
      await initializeChannels();
      break;

    case 'roles':
      await initializeRoles();
      break;

    default:
      logger.info(logMessageFunctions.noRefreshNeeded(property));
      break;
  }
};
