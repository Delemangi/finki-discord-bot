import {
  REST,
  Routes
} from 'discord.js';
import { client } from '../src/client.js';
import { getFromBotConfig } from '../src/config.js';
import { logger } from '../src/logger.js';

const commands = process.argv.slice(2);

if (commands === undefined || commands.length === 0) {
  throw new Error('Missing command IDs arguments');
}

await client.login(getFromBotConfig('token'));

client.once('ready', async () => {
  logger.info('Bot is ready');

  const rest = new REST().setToken(getFromBotConfig('token'));

  for (const command of commands) {
    await rest.delete(Routes.applicationCommand(getFromBotConfig('applicationID'), command));
  }

  logger.info('Done');
  client.destroy();
});
