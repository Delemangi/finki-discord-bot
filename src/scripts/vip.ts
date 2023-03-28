import { client } from '../utils/client.js';
import { getFromBotConfig, getResponses, getToken } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

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

  const components = [];
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Изјава за големи нешта')
    .setDescription(
      getResponses().find((response) => response.command === 'vip')?.response ??
        '-',
    );

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('vip:accept')
      .setLabel('Прифаќам')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('vip:decline')
      .setLabel('Одбивам')
      .setStyle(ButtonStyle.Danger),
  );
  components.push(row);

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
