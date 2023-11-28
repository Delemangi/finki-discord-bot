// eslint-disable-next-line import/no-unassigned-import
import "dotenv/config";
import { client } from "@app/utils/client.js";
import { registerCommands } from "@app/utils/commands.js";
import { checkEnvironmentVariables, getToken } from "@app/utils/config.js";
import { attachEventListeners } from "@app/utils/events.js";
import { remind } from "@app/utils/reminders.js";
import { logErrorFunctions } from "@app/utils/strings.js";

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
