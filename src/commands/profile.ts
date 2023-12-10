import { getStudentInfoEmbed } from "../components/commands.js";
import {
  commandDescriptions,
  commandErrors,
} from "../translations/commands.js";
import { getMemberFromGuild } from "../utils/guild.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "profile";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addUserOption((option) =>
    option.setName("user").setDescription("Корисник").setRequired(false),
  )
  .setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user") ?? interaction.user;
  const member = await getMemberFromGuild(user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotFound);

    return;
  }

  const embed = await getStudentInfoEmbed(member);
  await interaction.editReply({
    embeds: [embed],
  });
};
