import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { getStaffEmbed } from '../components/commands.js';
import { getStaff } from '../configuration/files.js';
import {
  commandDescriptions,
  commandErrors,
} from '../translations/commands.js';

const name = 'staff';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
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
    await interaction.editReply(commandErrors.staffNotFound);

    return;
  }

  const embed = getStaffEmbed(information);
  await interaction.editReply({
    embeds: [embed],
  });
};
