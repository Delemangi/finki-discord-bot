import { type BotConfigKeys } from '../lib/schemas/BotConfig.js';
import { logMessageFunctions } from '../translations/logs.js';
import { initializeChannels } from '../utils/channels.js';
import { logger } from '../utils/logger.js';
import { initializeRoles } from '../utils/roles.js';

export const refreshOnConfigChange = async (property: BotConfigKeys) => {
  logger.info(logMessageFunctions.configPropertyChanged(property));

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
