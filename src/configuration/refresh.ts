import { type BotConfigKeys } from '../lib/schemas/BotConfig.js';
import { logger } from '../logger.js';
import { logMessageFunctions } from '../translations/logs.js';
import { refreshAds } from '../utils/ads.js';
import { initializeChannels } from '../utils/channels.js';
import { initializeRoles } from '../utils/roles.js';

export const refreshOnConfigChange = async (property: BotConfigKeys) => {
  logger.info(logMessageFunctions.configPropertyChanged(property));

  switch (property) {
    case 'ads':
      refreshAds();
      break;

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
