import { commandDescriptions } from "@app/strings/commands.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "home";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.editReply("https://github.com/Delemangi/finki-discord-bot");
};
