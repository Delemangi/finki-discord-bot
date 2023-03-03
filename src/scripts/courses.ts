import { client } from '../utils/client.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getToken
} from '../utils/config.js';
import { logger } from '../utils/logger.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';

const [channelId, newlines, ...roleSets] = process.argv.slice(2);

if (channelId === undefined || roleSets === undefined || roleSets.length === 0) {
  throw new Error('Missing channel ID or role sets arguments');
}

await client.login(getToken());

client.once('ready', async () => {
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(channelId);

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error('The provided channel must be a guild text channel');
  }

  for (const [index, roleSet] of roleSets.entries()) {
    const roles = getFromRoleConfig('course')[roleSet];

    if (roles === undefined) {
      throw new Error(`Invalid role set provided: ${roleSet}`);
    }

    const components = [];
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(`${roleSet.length > 1 ? '' : 'Семестар'} ${roleSet}`)
      .setThumbnail(getFromBotConfig('logo'))
      .setDescription(roles.map((role, i) => `${(i + 1).toString().padStart(2, '0')}. ${getFromRoleConfig('courses')[role]}`).join('\n'))
      .setFooter({ text: '(може да изберете повеќе опции)' });

    for (let i = 0; i < roles.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons = [];

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
