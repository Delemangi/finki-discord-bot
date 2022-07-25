import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getAllQuetions } from '../src/faq.js';

export const data = new SlashCommandBuilder()
  .setName('list')
  .setDescription('Get all questions');

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder().setColor('Green').setTitle('Questions').setDescription(getAllQuetions().join('\n'));

  await interaction.reply({ embeds: [embed] });
}
