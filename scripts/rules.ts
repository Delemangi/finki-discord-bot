import {
  ChannelType,
  EmbedBuilder
} from 'discord.js';
import { client } from '../utils/client.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getRules
} from '../utils/config.js';
import { logger } from '../utils/logger.js';

const channelID = process.argv[2];

if (channelID === undefined) {
  throw new Error('Missing channel ID argument');
}

await client.login(getFromBotConfig('token'));

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelID);
  const roles = getFromRoleConfig('year');

  if (channel === undefined || channel.type !== ChannelType.GuildText) {
    throw new Error('The provided channel must be a guild text channel');
  }

  if (roles === undefined || roles.length === 0) {
    throw new Error('No year roles have been provided');
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Правила')
    .setThumbnail('https://cdn.discordapp.com/attachments/946729216152576020/1016773768938541106/finki-logo.png')
    .setDescription(`${getRules().map((value, index) => `${index + 1}. ${value}`).join('\n\n')} \n\n **Евентуално кршење на правилата може да доведе до санкции**.`);

  try {
    await channel.send({
      embeds: [embed]
    });
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
