import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import { getAnto } from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'anto';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const random = Math.floor(Math.random() * getAnto().length);

  await interaction.editReply(getAnto()[random] ?? '');
}
