import { getStaff } from '../utils/config.js';
import { getStaffEmbed } from '../utils/embeds.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'staff';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .addStringOption((option) =>
    option
      .setName('professor')
      .setDescription('Професор')
      .setRequired(true)
      .setAutocomplete(true),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const professor = interaction.options.getString('professor', true);
  const information = getStaff().find(
    (staff) => staff.name.toLowerCase() === professor.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply('Не постои таков професор.');
    return;
  }

  const embed = getStaffEmbed(information);
  await interaction.editReply({ embeds: [embed] });
};
