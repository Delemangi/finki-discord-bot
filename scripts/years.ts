import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} from 'discord.js';
import { client } from '../src/client.js';
import {
  getFromBotConfig,
  getFromRoleConfig
} from '../src/config.js';
import { logger } from '../src/logger.js';

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
    .setThumbnail('http://fss.finki.ukim.mk/wp-content/uploads/2020/11/cropped-fssFINKI-logo.png')
    .setTitle('Година на студирање')
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
    await channel.send({
      components: [components],
      content: newlines === undefined || Number.isNaN(newlines) ? null : Array.from<string>({ length: Number.parseInt(newlines) + 1 }).fill('_ _', 0, -1).join('\n'),
      embeds: [embed]
    });
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
