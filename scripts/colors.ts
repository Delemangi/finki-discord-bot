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

const [channelID, image, newlines] = process.argv.slice(2);

if (channelID === undefined || image === undefined) {
  throw new Error('Missing channel ID or image argument');
}

await client.login(getFromBotConfig('token'));

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelID);
  const roles = getFromRoleConfig('color');

  if (channel === undefined || channel.type !== ChannelType.GuildText) {
    throw new Error('The provided channel must be a guild text channel');
  }

  if (roles === undefined || roles.length === 0) {
    throw new Error('No color roles have been provided');
  }

  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Боја на име')
    .setThumbnail('https://cdn.discordapp.com/attachments/946729216152576020/1016773768938541106/finki-logo.png')
    .setDescription('Изберете боја за вашето име со кликање на бројот со кој е означена бојата.')
    .setFooter({ text: '(може да изберете само една опција)' })
    .setImage(image);

  for (let i = 0; i < roles.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons: ButtonBuilder[] = [];

    for (let j = i; j < i + 5; j++) {
      if (roles[j] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`color:${roles[j] ?? ''}`)
        .setLabel(`${j + 1}`)
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
        embeds: [embed]
      });
    } else {
      await channel.send({
        components,
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
