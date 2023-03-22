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
  const roles = getFromRoleConfig('year');

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error('The provided channel must be a guild text channel');
  }

  if (roles === undefined || roles.length === 0) {
    throw new Error('No year roles have been provided');
  }

  const components = new ActionRowBuilder<ButtonBuilder>();
  const buttons = [];
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Година на студирање')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription('Изберете ја годината на студирање.')
    .setFooter({
      text: '(може да изберете само една опција, секоја нова опција ја заменува старата)',
    });

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
        embeds: [embed],
      });
    } else {
      await channel.send({
        components: [components],
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
