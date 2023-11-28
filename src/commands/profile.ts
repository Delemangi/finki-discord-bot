import { getStudentInfoEmbed } from "@app/components/commands.js";
import { commandDescriptions, commandErrors } from "@app/strings/commands.js";
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
  const member = interaction.guild?.members.cache.get(user.id);

  if (member === undefined) {
    await interaction.editReply(commandErrors.userNotFound);

    return;
  }

  const embed = await getStudentInfoEmbed(member);
  await interaction.editReply({
    embeds: [embed],
  });
};
