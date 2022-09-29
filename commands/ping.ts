import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import { client } from '../utils/client.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'ping';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.editReply(`Pong! ${client.ws.ping.toString()} ms`);
}
