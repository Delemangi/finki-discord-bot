// eslint-disable-next-line import/no-unassigned-import
import { client } from "./utils/client.js";
import { checkConfig, getFromBotConfig, getToken } from "./utils/config.js";
import { attachEventListeners } from "./utils/events.js";
import { logger } from "./utils/logger.js";
import { remind } from "./utils/reminders.js";

const mode = getFromBotConfig("mode");

logger.info(`Running in ${mode} mode`);

// Initialization

checkConfig();
await attachEventListeners();
void remind();

// Login

try {
  await client.login(getToken());
} catch (error) {
  throw new Error(`Failed to login\n${error}`);
}
