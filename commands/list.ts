import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getAllQuetions } from '../src/faq.js';

export const data = new SlashCommandBuilder()
  .setName('list')
  .setDescription('Get all questions');

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder().setColor('Green').setTitle('Questions').setDescription(getAllQuetions().map((question, index) => `${index + 1}. ${question}`).join('\n\n'));

  await interaction.editReply({ embeds: [embed] });
}
