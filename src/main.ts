import { client } from './utils/client.js';
import {
  checkConfig,
  getFromBotConfig,
  getToken
} from './utils/config.js';
import { attachEventListeners } from './utils/events.js';
import { logger } from './utils/logger.js';

checkConfig();
await attachEventListeners();

const mode = getFromBotConfig('mode');

try {
  await client.login(getToken());
} catch (error) {
  throw new Error(`Failed to login\n${error}`);
}

logger.info(`Running in ${mode} mode`);
