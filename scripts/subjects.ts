import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from 'discord.js';
import { client } from '../src/client.js';
import { getFromBotConfig, getFromRoleConfig, getSubject } from '../src/config.js';
import { logger } from '../src/logger.js';

const [channelID, ...roleSets] = process.argv.slice(2);

if (channelID === undefined || roleSets === undefined) {
  throw new Error('Missing channelID or role set. Please provide them and try again.');
}

await client.login(getFromBotConfig('token'));

client.once('ready', async () => {
  logger.info('Bot is ready!');

  const channel = client.channels.cache.get(channelID);

  if (channel === undefined || channel.type !== ChannelType.GuildText) {
    throw new Error('Invalid channel provided.');
  }

  for (const roleSet of roleSets) {
    const roles = getFromRoleConfig('subject')[roleSet];

    if (roles === undefined) {
      throw new Error('Invalid role set provided.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`Семестар ${roleSet}`)
      .setDescription(roles.map((role, i) => `${(i + 1).toString().padStart(2, '0')}. ${getSubject(role)}`).join('\n'));
    const components: ActionRowBuilder<ButtonBuilder>[] = [];

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

    await channel.send({ embeds: [embed], components });
  }

  logger.info('Embeds sent. Exiting.');

  process.exit(0);
});
