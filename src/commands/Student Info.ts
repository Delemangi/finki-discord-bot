import { getStudentInfoEmbed } from '../components/commands.js';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  type GuildMember,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

const name = 'Student Info';

export const data = new ContextMenuCommandBuilder()
  .setName(name)
  // @ts-expect-error discord-api-types issue
  .setType(ApplicationCommandType.User)
  .setDMPermission(false);

export const execute = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  const embed = await getStudentInfoEmbed(
    interaction.targetMember as GuildMember,
  );
  await interaction.editReply({
    embeds: [embed],
  });
};
