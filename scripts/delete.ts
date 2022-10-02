import {
  REST,
  Routes
} from 'discord.js';
import { client } from '../utils/client.js';
import { getFromBotConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

const commands = process.argv.slice(2);

if (commands === undefined || commands.length === 0) {
  client.once('ready', async () => {
    logger.info('Bot is ready');

    const rest = new REST().setToken(getFromBotConfig('token'));
    await rest.put(Routes.applicationCommands(getFromBotConfig('applicationID')), { body: [] });

    logger.info('Done');
    client.destroy();
  });
} else {
  client.once('ready', async () => {
    logger.info('Bot is ready');

    const rest = new REST().setToken(getFromBotConfig('token'));

    for (const command of commands) {
      await rest.delete(Routes.applicationCommand(getFromBotConfig('applicationID'), command));
    }

    logger.info('Done');
    client.destroy();
  });
}

await client.login(getFromBotConfig('token'));

