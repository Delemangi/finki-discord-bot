import {
  commandDescriptions,
  commandResponseFunctions,
} from "@app/strings/commands.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "members";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.editReply(
    commandResponseFunctions.serverMembers(interaction.guild?.memberCount),
  );
};
