import { getRandomAnto } from "@app/data/Anto.js";
import {
  commandDescriptions,
  commandErrors,
} from "@app/translations/commands.js";
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
