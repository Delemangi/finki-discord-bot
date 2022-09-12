import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import { client } from '../utils/client.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Ping!');

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.editReply(`Pong! ${client.ws.ping.toString()} ms`);
}
