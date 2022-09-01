import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from 'discord.js';
import { client } from '../src/client.js';
import { getFromBotConfig, getFromRoleConfig } from '../src/config.js';
import { logger } from '../src/logger.js';

const [channelID, image] = [process.argv[2], process.argv[3]];

if (channelID === undefined || image === undefined) {
  throw new Error('Missing channelID or image. Please provide them and try again.');
}

await client.login(getFromBotConfig('token'));

client.once('ready', async () => {
  logger.info('Bot is ready!');

  const channel = client.channels.cache.get(channelID);
  const roles = getFromRoleConfig('color');

  if (channel === undefined || channel.type !== ChannelType.GuildText) {
    throw new Error('Invalid channel provided.');
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setImage(image);
  const components: ActionRowBuilder<ButtonBuilder>[] = [];

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

  await channel.send({ embeds: [embed], components });
  logger.info('Embed sent. Exiting.');

  process.exit(0);
});
