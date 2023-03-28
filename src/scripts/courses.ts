import { client } from '../utils/client.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getToken,
} from '../utils/config.js';
import { logger } from '../utils/logger.js';
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  inlineCode,
} from 'discord.js';

const [channelId, newlines, ...roleSets] = process.argv.slice(2);

if (
  channelId === undefined ||
  roleSets === undefined ||
  roleSets.length === 0
) {
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
      .setDescription(
        roles
          .map(
            (role, index_) =>
              `${inlineCode((index_ + 1).toString().padStart(2, '0'))}. ${
                getFromRoleConfig('courses')[role]
              }`,
          )
          .join('\n'),
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
          .setCustomId(`course:${roles[index2]}`)
          .setLabel(`${index2 + 1}`)
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
  }

  const removeComponents = [];
  const removeEmbed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Масовно отстранување предмети')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      `Отстранете предмети од одредени семестри чии канали не сакате да ги гледате.\n\n${bold(
        'НАПОМЕНА',
      )}: Внимавајте! Можете да отстраните повеќе предмети од што сакате! Нема враќање назад доколку несакајќи отстраните предмети!`,
    )
    .setFooter({ text: '(може да изберете повеќе опции)' });

  for (let index1 = 0; index1 < roleSets.length + 5; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    if (index1 >= roleSets.length) {
      const removeAllButton = new ButtonBuilder()
        .setCustomId(`removeCourses:all`)
        .setLabel('Сите')
        .setStyle(ButtonStyle.Danger);

      const removeAllRow = new ActionRowBuilder<ButtonBuilder>();

      removeAllRow.addComponents(removeAllButton);
      removeComponents.push(removeAllRow);
      break;
    }

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roleSets[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`removeCourses:${roleSets[index2]}`)
        .setLabel(`Семестар ${roleSets[index2]}`)
        .setStyle(ButtonStyle.Danger);

      buttons.push(button);
    }

    row.addComponents(buttons);
    removeComponents.push(row);
  }

  try {
    await channel.send({
      components: removeComponents,
      content: '_ _',
      embeds: [removeEmbed],
    });
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info('Done');
  client.destroy();
});
