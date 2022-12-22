import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'members';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.editReply(`Серверот има ${interaction.guild?.memberCount} членови.`);
}
