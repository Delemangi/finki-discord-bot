import { sendEmbed } from '../utils/channels.js';
import { client } from '../utils/client.js';
import { getFromRoleConfig, getToken } from '../utils/config.js';
import {
  getActivitiesComponents,
  getActivitiesEmbed,
} from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

const [channelId, newlines] = process.argv.slice(2);

if (channelId === undefined) {
  throw new Error('Missing channel ID argument');
}

await client.login(getToken());

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelId);
  const roles = getFromRoleConfig('activity');

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error('The provided channel must be a guild text channel');
  }

  if (roles.length === 0) {
    throw new Error('No activity roles have been provided');
  }

  const embed = getActivitiesEmbed();
  const components = getActivitiesComponents();
  try {
    await sendEmbed(channel, embed, components, Number(newlines));
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
