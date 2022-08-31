import { REST, Routes } from 'discord.js';
import { client } from '../src/client.js';
import { getFromBotConfig } from '../src/config.js';
import { logger } from '../src/logger.js';

const commands = process.argv.slice(2);

if (commands === undefined) {
  throw new Error('Missing commands. Please provide them and try again.');
}

await client.login(getFromBotConfig('token'));

client.once('ready', async () => {
  logger.info('Bot is ready!');

  const rest = new REST().setToken(getFromBotConfig('token'));

  for (const command of commands) {
    await rest.delete(Routes.applicationCommand(getFromBotConfig('applicationID'), command));
  }

  logger.info('Commands deleted. Exiting.');

  process.exit(0);
});
