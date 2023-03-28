import { client } from '../utils/client.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getRules,
  getToken,
} from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { EmbedBuilder, inlineCode, italic } from 'discord.js';

const channelId = process.argv[2];

if (channelId === undefined) {
  throw new Error('Missing channel ID argument');
}

await client.login(getToken());

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelId);
  const roles = getFromRoleConfig('year');

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error('The provided channel must be a guild text channel');
  }

  if (roles === undefined || roles.length === 0) {
    throw new Error('No year roles have been provided');
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Правила')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      `${getRules()
        .map(
          (value, index) =>
            `${inlineCode((index + 1).toString().padStart(2, '0'))} ${value}`,
        )
        .join('\n\n')} \n\n ${italic(
        'Евентуално кршење на правилата може да доведе до санкции',
      )}.`,
    );

  try {
    await channel.send({
      embeds: [embed],
    });
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
