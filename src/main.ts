// eslint-disable-next-line import/no-unassigned-import
import "dotenv/config";
import { client } from "./utils/client.js";
import { registerCommands } from "./utils/commands.js";
import { checkEnvironmentVariables, getToken } from "./utils/config.js";
import { attachEventListeners } from "./utils/events.js";
import { remind } from "./utils/reminders.js";
import { logErrorFunctions } from "./utils/strings.js";

// Initialization

await checkEnvironmentVariables();

await registerCommands();
await attachEventListeners();

void remind();

// Login

try {
  await client.login(getToken());
} catch (error) {
  throw new Error(logErrorFunctions.loginFailed(error));
}
