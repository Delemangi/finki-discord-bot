import { getStudentInfoEmbed } from "@app/utils/components.js";
import { commandDescriptions, commandErrors } from "@app/utils/strings.js";
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
  const member = interaction.guild?.members.cache.get(
    (interaction.options.getUser("user") ?? interaction.user).id,
  );

  if (member === undefined) {
    await interaction.editReply(commandErrors.userNotFound);

    return;
  }

  const embed = await getStudentInfoEmbed(member);
  await interaction.editReply({
    embeds: [embed],
  });
};
