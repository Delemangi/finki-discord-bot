import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getAllOptions, getComponentsFromQuestion, getEmbedFromQuestion, getQuestion } from '../src/faq.js';

export const data = new SlashCommandBuilder()
  .setName('faq')
  .setDescription('Get a question')
  .addStringOption(option => option
    .setName('name')
    .setDescription('Question')
    .setRequired(true)
    .addChoices(...getAllOptions()));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const keyword = interaction.options.getString('name') ?? '';
  const question = getQuestion(keyword);
  const embed = getEmbedFromQuestion(question);
  const components = getComponentsFromQuestion(question);

  await interaction.editReply({ embeds: [embed], components });
}
