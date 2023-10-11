import { client } from "../utils/client.js";
import {
  commandDescriptions,
  commandResponseFunctions,
} from "../utils/strings.js";
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
