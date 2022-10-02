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

  for (const [index, roleSet] of roleSets.entries()) {
    const roles = getFromRoleConfig('course')[roleSet];

    if (roles === undefined) {
      throw new Error(`Invalid role set provided: ${roleSet}`);
    }

    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(`${roleSet.length > 1 ? '' : 'Семестар'} ${roleSet}`)
      .setThumbnail('https://cdn.discordapp.com/attachments/946729216152576020/1016773768938541106/finki-logo.png')
      .setDescription(roles.map((role, i) => `${(i + 1).toString().padStart(2, '0')}. ${getFromRoleConfig('courses')[role]}`).join('\n'))
      .setFooter({ text: '(може да изберете повеќе опции)' });

    for (let i = 0; i < roles.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons: ButtonBuilder[] = [];

      for (let j = i; j < i + 5; j++) {
        if (roles[j] === undefined) {
          break;
        }

        const button = new ButtonBuilder()
          .setCustomId(`course:${roles[j]}`)
          .setLabel(`${j + 1}`)
          .setStyle(ButtonStyle.Secondary);

        buttons.push(button);
      }

      row.addComponents(buttons);
      components.push(row);
    }

    try {
      if (index === 0 || newlines === undefined || Number.isNaN(newlines)) {
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
  }

  logger.info('Done');
  client.destroy();
});
