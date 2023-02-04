import { getAboutEmbed } from '../utils/embeds.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

const name = 'about';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name]);

export async function execute (interaction: ChatInputCommandInteraction) {
  const embed = getAboutEmbed();
  await interaction.editReply({ embeds: [embed] });
}
