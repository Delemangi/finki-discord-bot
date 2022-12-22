import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import { toggleCrossposting } from '../utils/crossposting.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'crosspost';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.editReply(`Crossposting е ${toggleCrossposting() ? 'вклучено' : 'исклучено'}.`);
}
