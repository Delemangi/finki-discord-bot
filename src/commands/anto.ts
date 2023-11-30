import { getRandomAnto } from "../data/Anto.js";
import {
  commandDescriptions,
  commandErrors,
} from "../translations/commands.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "anto";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const anto = await getRandomAnto();
  await interaction.editReply(anto?.quote ?? commandErrors.noAnto);
};
