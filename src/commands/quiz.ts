import { getQuizComponents, getQuizEmbed } from "../utils/components.js";
import { commandDescriptions } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "quiz";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const embed = await getQuizEmbed();
  const components = getQuizComponents(interaction);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};
