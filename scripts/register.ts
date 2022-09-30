import { readdirSync } from 'node:fs';
import {
  Collection,
  REST,
  Routes
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

const applicationID = getFromBotConfig('applicationID');
const token = getFromBotConfig('token');
const rest = new REST().setToken(token);

const files = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));
const commands = new Collection<string, Command>();
const commandsJSON: string[] = [];

for (const file of files) {
  const command: Command = await import(`../commands/${file}`);
  commands.set(command.data.name, command);
  commandsJSON.push(command.data.toJSON());

  logger.info(`Command: ${command.data.name}`);
}

try {
  await rest.put(Routes.applicationCommands(applicationID), { body: commandsJSON });
  logger.info('Successfully registered application commands');
} catch (error) {
  throw new Error(`Failed to register application commands\n${error}`);
}
