import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from 'discord.js';
import { client } from '../src/client.js';
import { getFromBotConfig, getFromRoleConfig } from '../src/config.js';
import { logger } from '../src/logger.js';

const channelID = process.argv[2];

if (channelID === undefined) {
  throw new Error('Missing channelID. Please provide it and try again.');
}

await client.login(getFromBotConfig('token'));

client.once('ready', async () => {
  logger.info('Bot is ready!');

  const channel = client.channels.cache.get(channelID);
  const roles = getFromRoleConfig('year');

  if (channel === undefined || channel.type !== ChannelType.GuildText) {
    throw new Error('Invalid channel provided.');
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Година на студирање');
  const components = new ActionRowBuilder<ButtonBuilder>();
  const buttons: ButtonBuilder[] = [];

  for (const role of roles) {
    const button = new ButtonBuilder()
      .setCustomId(`year:${role}`)
      .setLabel(role)
      .setStyle(ButtonStyle.Secondary);

    buttons.push(button);
  }
  components.addComponents(buttons);

  await channel.send({ embeds: [embed], components: [components] });
  logger.info('Embed sent. Exiting.');

  process.exit(0);
});
