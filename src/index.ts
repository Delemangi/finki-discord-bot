import { client } from './client.js';
import { getToken } from './configuration/environment.js';
import { logErrorFunctions } from './translations/logs.js';
import { registerCommands } from './utils/commands.js';
import { attachEventListeners } from './utils/events.js';

await registerCommands();
await attachEventListeners();

// Login

try {
  await client.login(getToken());
} catch (error) {
  throw new Error(logErrorFunctions.loginFailed(error));
}
