import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'calendar';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.editReply('https://cdn.discordapp.com/attachments/1055620145336303666/1055620275204522074/image.png');
}
