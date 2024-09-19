import { logErrorFunctions } from './translations/logs.js';
import { client } from './utils/client.js';
import { registerCommands } from './utils/commands.js';
import { checkEnvironmentVariables, getToken } from './utils/config.js';
import { attachEventListeners } from './utils/events.js';
import { remind } from './utils/reminders.js';
import { closeSpecialPolls } from './utils/special.js';
import { closeInactiveTickets } from './utils/tickets.js';
// eslint-disable-next-line import/no-unassigned-import
import 'dotenv/config';

// Initialization

await checkEnvironmentVariables();

await registerCommands();
await attachEventListeners();

void remind();
void closeSpecialPolls();
void closeInactiveTickets();

// Login

try {
  await client.login(getToken());
} catch (error) {
  throw new Error(logErrorFunctions.loginFailed(error));
}
