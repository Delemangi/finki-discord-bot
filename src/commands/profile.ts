import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';

import { getStudentInfoEmbed } from '../components/commands.js';
import {
  commandDescriptions,
  commandErrors,
} from '../translations/commands.js';
import { getMemberFromGuild } from '../utils/guild.js';

const name = 'profile';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addUserOption((option) =>
    option.setName('user').setDescription('Корисник').setRequired(false),
  )
  .setContexts(InteractionContextType.Guild);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const member = await getMemberFromGuild(user.id, interaction.guild);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotFound);

    return;
  }

  const embed = getStudentInfoEmbed(member);
  await interaction.editReply({
    embeds: [embed],
  });
};
