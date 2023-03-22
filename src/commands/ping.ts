import { client } from '../utils/client.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'ping';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.editReply(`Понг! ${client.ws.ping.toString()} ms`);
};
