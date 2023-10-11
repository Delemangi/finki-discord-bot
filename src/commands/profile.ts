import { getStudentInfoEmbed } from "../utils/components.js";
import { commandDescriptions } from "../utils/strings.js";
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
  const embed = await getStudentInfoEmbed(member);
  await interaction.editReply({
    embeds: [embed],
  });
};
