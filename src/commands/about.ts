import { getAboutEmbed } from "@app/utils/components.js";
import { commandDescriptions } from "@app/utils/strings.js";
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
