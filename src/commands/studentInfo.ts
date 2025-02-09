import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  type GuildMember,
  InteractionContextType,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

import { getStudentInfoEmbed } from '../components/commands.js';

const name = 'Student Info';

export const data = new ContextMenuCommandBuilder()
  .setName(name)
  .setType(ApplicationCommandType.User)
  .setContexts(InteractionContextType.Guild);

export const execute = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  const embed = getStudentInfoEmbed(interaction.targetMember as GuildMember);
  await interaction.editReply({
    embeds: [embed],
  });
};
