import { getStudentInfoEmbed } from "../utils/components.js";
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  type GuildMember,
  type UserContextMenuCommandInteraction,
} from "discord.js";

const name = "Student Info";

export const data = new ContextMenuCommandBuilder()
  .setName(name)
  .setType(ApplicationCommandType.User)
  .setDMPermission(false);

export const execute = async (
  interaction: UserContextMenuCommandInteraction
) => {
  const embed = await getStudentInfoEmbed(
    interaction.targetMember as GuildMember
  );
  await interaction.editReply({ embeds: [embed] });
};
