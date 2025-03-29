import { client } from './client.js';
import { getToken } from './configuration/environment.js';
import { reloadConfigurationFiles } from './configuration/files.js';
import { reloadDatabaseConfig } from './configuration/main.js';
import { logErrorFunctions } from './translations/logs.js';
import { registerCommands } from './utils/commands.js';
import { attachEventListeners } from './utils/events.js';
import { attachProcessListeners } from './utils/process.js';

await Promise.all([reloadDatabaseConfig(), reloadConfigurationFiles()]);

attachProcessListeners();
await registerCommands();
await attachEventListeners();

// Login

try {
  await client.login(getToken());
} catch (error) {
  throw new Error(logErrorFunctions.loginFailed(error));
}
