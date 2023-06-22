import { client } from '../utils/client.js';
import { getCompanies, getToken } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ChannelType, inlineCode } from 'discord.js';

const [channelId] = process.argv.slice(2);

if (channelId === undefined) {
  throw new Error('Missing channel ID argument');
}

await client.login(getToken());

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelId);

  if (channel === undefined || channel.type !== ChannelType.GuildForum) {
    throw new Error('The provided channel must be a guild forum channel');
  }

  for (const company of getCompanies()) {
    await channel.threads.create({
      message: {
        content: `Овој канал е за компанијата ${inlineCode(company)}.`,
      },
      name: company,
    });
  }

  logger.info('Done');
  client.destroy();
});
