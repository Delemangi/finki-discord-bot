import { client } from '../utils/client.js';
import { getToken } from '../utils/config.js';
import {
  getVipRequestComponents,
  getVipRequestEmbed,
} from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

const channelId = process.argv[2];

if (channelId === undefined) {
  throw new Error('Missing channel ID argument');
}

await client.login(getToken());

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelId);

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error('The provided channel must be a guild text channel');
  }

  const embed = getVipRequestEmbed();
  const components = getVipRequestComponents();
  try {
    await channel.send({
      components,
      embeds: [embed],
    });
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
