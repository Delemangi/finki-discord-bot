import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getAllOptions, getEmbedFromQuestion, getQuestion } from '../src/faq.js';

export const data = new SlashCommandBuilder()
  .setName('faq')
  .setDescription('Get a question')
  .addStringOption(option => option
    .setName('keyword')
    .setDescription('Keyword')
    .setRequired(true)
    .addChoices(...getAllOptions()));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const keyword = interaction.options.getString('keyword') ?? '';
  const question = getQuestion(keyword);
  const embed = getEmbedFromQuestion(question);

  await interaction.reply({ embeds: [embed] });
}
