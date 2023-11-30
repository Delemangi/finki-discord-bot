import {
  commandDescriptions,
  commandResponseFunctions,
} from "../translations/commands.js";
import { client } from "../utils/client.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "ping";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.editReply(commandResponseFunctions.ping(client.ws.ping));
};
