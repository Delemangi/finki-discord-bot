import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

const name = 'invite';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .setDMPermission(false);

export async function execute (interaction: ChatInputCommandInteraction) {
  await interaction.editReply(`https://discord.gg/${interaction.guild?.vanityURLCode ?? 'Настана грешка.'}`);
}
