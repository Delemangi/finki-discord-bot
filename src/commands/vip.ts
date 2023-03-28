import { getVipEmbed } from '../utils/embeds.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'vip';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    return;
  }

  if (
    !interaction.channel.parent?.name.includes('ВИП') &&
    !interaction.channel.parent?.name.includes('VIP')
  ) {
    await interaction.editReply('Оваа команда е само за во ВИП.');
    return;
  }

  const embeds = await getVipEmbed(interaction);
  await interaction.editReply({ embeds });
};
