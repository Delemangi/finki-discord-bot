import {
  commandDescriptions,
  commandResponseFunctions,
} from "@app/strings/commands.js";
import { client } from "@app/utils/client.js";
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
