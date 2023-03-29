import { sendEmbed } from '../utils/channels.js';
import { client } from '../utils/client.js';
import { getFromRoleConfig, getToken } from '../utils/config.js';
import {
  getCoursesAddComponents,
  getCoursesAddEmbed,
  getCoursesComponents,
  getCoursesEmbed,
  getCoursesRemoveComponents,
  getCoursesRemoveEmbed,
} from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

const [channelId, newlines, ...roleSets] = process.argv.slice(2);

if (channelId === undefined) {
  throw new Error('Missing channel ID arguments');
}

await client.login(getToken());

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelId);

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error('The provided channel must be a guild text channel');
  }

  for (const roleSet of roleSets.length === 0 ? '12345678' : roleSets) {
    const roles = getFromRoleConfig('course')[roleSet];

    if (roles === undefined) {
      throw new Error(`Invalid role set provided: ${roleSet}`);
    }

    const embed = getCoursesEmbed(roleSet, roles);
    const components = getCoursesComponents(roles);
    try {
      await sendEmbed(channel, embed, components, Number(newlines));
    } catch (error) {
      throw new Error(`Failed to send embed\n${error}`);
    }
  }

  const addEmbed = getCoursesAddEmbed();
  const addComponents = getCoursesAddComponents(
    roleSets.length === 0 ? Array.from('12345678') : roleSets,
  );
  try {
    await sendEmbed(channel, addEmbed, addComponents, Number(newlines));
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  const removeEmbed = getCoursesRemoveEmbed();
  const removeComponents = getCoursesRemoveComponents(
    roleSets.length === 0 ? Array.from('12345678') : roleSets,
  );
  try {
    await sendEmbed(channel, removeEmbed, removeComponents, Number(newlines));
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
