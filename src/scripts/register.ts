import { getCommands } from '../utils/commands.js';
import { getApplicationId, getToken } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { REST, Routes } from 'discord.js';

const rest = new REST().setToken(getToken());
const commands = [];

for (const [, command] of await getCommands()) {
  commands.push(command.data.toJSON());
}

try {
  await rest.put(Routes.applicationCommands(getApplicationId()), {
    body: commands,
  });
  logger.info('Done');
} catch (error) {
  throw new Error(`Failed to register application commands\n${error}`);
}
