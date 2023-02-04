import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

const name = 'members';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name]);

export async function execute (interaction: ChatInputCommandInteraction) {
  await interaction.editReply(`Серверот има ${interaction.guild?.memberCount} членови.`);
}
