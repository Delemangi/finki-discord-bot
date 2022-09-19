import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} from 'discord.js';
import { client } from '../utils/client.js';
import {
  getFromBotConfig,
  getFromRoleConfig
} from '../utils/config.js';
import { logger } from '../utils/logger.js';

const [channelID, newlines] = process.argv.slice(2);

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

  const components = new ActionRowBuilder<ButtonBuilder>();
  const buttons: ButtonBuilder[] = [];
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Година на студирање')
    .setThumbnail('https://cdn.discordapp.com/attachments/946729216152576020/1016773768938541106/finki-logo.png')
    .setDescription('Изберете ја годината на студирање.')
    .setFooter({ text: '(може да изберете само една опција)' });

  for (const role of roles) {
    const button = new ButtonBuilder()
      .setCustomId(`year:${role}`)
      .setLabel(role)
      .setStyle(ButtonStyle.Secondary);

    buttons.push(button);
  }

  components.addComponents(buttons);

  try {
    if (newlines === undefined || Number.isNaN(newlines)) {
      await channel.send({
        components: [components],
        embeds: [embed]
      });
    } else {
      await channel.send({
        components: [components],
        content: '_ _\n'.repeat(Number(newlines)),
        embeds: [embed]
      });
    }
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
