import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getAllQuetions } from '../src/faq.js';
import { getAllLinks } from '../src/links.js';

export const data = new SlashCommandBuilder()
  .setName('list')
  .setDescription('Get all...')
  .addSubcommand(command => command
    .setName('questions')
    .setDescription('Get all questions'))
  .addSubcommand(command => command
    .setName('links')
    .setDescription('Get all links'));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  let embed;

  if (interaction.options.getSubcommand() === 'questions') {
    embed = new EmbedBuilder().setColor('Green').setTitle('Questions').setDescription(getAllQuetions().map((question, index) => `${index + 1}. ${question}`).join('\n\n'));
  } else {
    embed = new EmbedBuilder().setColor('Red').setTitle('Links').setDescription(getAllLinks().map((link, index) => `${index + 1}. ${link}`).join('\n\n'));
  }

  await interaction.editReply({ embeds: [embed] });
}
