import { getResponses } from "../utils/config.js";
import { commandDescriptions } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "timetable";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const response = getResponses().find((resp) => resp.command === name);

  if (response === undefined) {
    await interaction.reply("Настана грешка при одговарање.");
    return;
  }

  await interaction.editReply(response.response);
};
