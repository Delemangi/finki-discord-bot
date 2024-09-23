import { logErrorFunctions } from './translations/logs.js';
import { client } from './utils/client.js';
import { registerCommands } from './utils/commands.js';
import { checkEnvironmentVariables, getToken } from './utils/config.js';
import { attachEventListeners } from './utils/events.js';
// eslint-disable-next-line import/no-unassigned-import
import 'dotenv/config';

// Pre-initialization

await checkEnvironmentVariables();

// Post-initialization

await registerCommands();
await attachEventListeners();

// Login

try {
  await client.login(getToken());
} catch (error) {
  throw new Error(logErrorFunctions.loginFailed(error));
}
