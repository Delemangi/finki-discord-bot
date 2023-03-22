import { client } from '../utils/client.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getToken,
} from '../utils/config.js';
import { logger } from '../utils/logger.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

const [channelId, newlines] = process.argv.slice(2);

if (channelId === undefined) {
  throw new Error('Missing channel ID argument');
}

await client.login(getToken());

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelId);
  const roles = getFromRoleConfig('notification');

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error('The provided channel must be a guild text channel');
  }

  if (roles === undefined || roles.length === 0) {
    throw new Error('No notification roles have been provided');
  }

  const components: Array<ActionRowBuilder<ButtonBuilder>> = [];
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Нотификации')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      'Изберете за кои типови на објави сакате да добиете нотификации.',
    )
    .setFooter({ text: '(може да изберете повеќе опции)' });

  for (let index1 = 0; index1 < roles.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roles[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`notification:${roles[index2] ?? ''}`)
        .setLabel(roles[index2] ?? '')
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  try {
    if (newlines === undefined || Number.isNaN(newlines)) {
      await channel.send({
        components,
        embeds: [embed],
      });
    } else {
      await channel.send({
        components,
        content: '_ _\n'.repeat(Number(newlines)),
        embeds: [embed],
      });
    }
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
