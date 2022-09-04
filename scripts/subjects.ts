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
  getFromRoleConfig,
  getSubject
} from '../src/config.js';
import { logger } from '../src/logger.js';

const [channelID, newlines, ...roleSets] = process.argv.slice(2);

if (channelID === undefined || roleSets === undefined || roleSets.length === 0) {
  throw new Error('Missing channel ID or role sets arguments');
}

await client.login(getFromBotConfig('token'));

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelID);

  if (channel === undefined || channel.type !== ChannelType.GuildText) {
    throw new Error('The provided channel must be a guild text channel');
  }

  for (const roleSet of roleSets) {
    const roles = getFromRoleConfig('subject')[roleSet];

    if (roles === undefined) {
      throw new Error(`Invalid role set provided: ${roleSet}`);
    }

    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(`${roleSet.length > 1 ? '' : 'Семестар'} ${roleSet}`)
      .setDescription(roles.map((role, i) => `${(i + 1).toString().padStart(2, '0')}. ${getSubject(role)}`).join('\n'));

    for (let i = 0; i < roles.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons: ButtonBuilder[] = [];

      for (let j = i; j < i + 5; j++) {
        if (roles[j] === undefined) {
          break;
        }

        const button = new ButtonBuilder()
          .setCustomId(`subject:${roles[j]}`)
          .setLabel(`${j + 1}`)
          .setStyle(ButtonStyle.Secondary);

        buttons.push(button);
      }

      row.addComponents(buttons);
      components.push(row);
    }

    try {
      await channel.send({
        components,
        content: newlines === undefined || Number.isNaN(newlines) ? null : Array.from<string>({ length: Number.parseInt(newlines) + 1 }).fill('_ _', 0, -1).join('\n'),
        embeds: [embed]
      });
    } catch (error) {
      throw new Error(`Failed to send embed\n${error}`);
    }
  }

  logger.info('Done');
  client.destroy();
});
