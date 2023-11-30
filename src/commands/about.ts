import { getAboutEmbed } from "../components/commands.js";
import { commandDescriptions } from "../translations/commands.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "about";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const embed = await getAboutEmbed();
  await interaction.editReply({
    embeds: [embed],
  });
};
