import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  userMention,
} from 'discord.js';

const name = 'server';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const messages = [];

  messages.push(`Име: ${interaction.guild?.name}`);
  messages.push(
    `Сопственик: ${
      interaction.guild === null ? '-' : userMention(interaction.guild?.ownerId)
    }`,
  );
  messages.push(`Членови: ${interaction.guild?.memberCount}`);
  await interaction.guild?.channels.fetch();
  messages.push(`Канали: ${interaction.guild?.channels.cache.size}`);
  messages.push(
    `Канали (без нишки): ${
      interaction.guild?.channels.cache.filter((channel) => !channel.isThread())
        .size
    } / 500`,
  );
  await interaction.guild?.roles.fetch();
  messages.push(`Улоги: ${interaction.guild?.roles.cache.size} / 250`);
  await interaction.guild?.emojis.fetch();
  messages.push(`Емоџиња: ${interaction.guild?.emojis.cache.size} / 50`);
  await interaction.guild?.stickers.fetch();
  messages.push(`Стикери: ${interaction.guild?.stickers.cache.size} / 50`);
  await interaction.guild?.invites.fetch();
  messages.push(`Покани: ${interaction.guild?.invites.cache.size}`);

  await interaction.editReply({
    allowedMentions: { parse: [] },
    content: messages.join('\n'),
  });
};
