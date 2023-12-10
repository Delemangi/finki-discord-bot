import {
  commandDescriptions,
  commandResponseFunctions,
} from "../translations/commands.js";
import { getGuild } from "../utils/guild.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "members";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  await interaction.editReply(
    commandResponseFunctions.serverMembers(guild?.memberCount),
  );
};
