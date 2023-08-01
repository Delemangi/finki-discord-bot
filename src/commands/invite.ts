import { commandDescriptions } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "invite";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.editReply(
    `https://discord.gg/${
      interaction.guild?.vanityURLCode ?? "Настана грешка."
    }`
  );
};
