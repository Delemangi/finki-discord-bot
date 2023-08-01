import { getAnto } from "../utils/config.js";
import { commandDescriptions } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "anto";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const anto =
    getAnto()[Math.floor(Math.random() * getAnto().length)] ?? "Нема Анто";
  await interaction.editReply(anto);
};
