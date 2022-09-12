import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { getAllQuestions } from '../utils/faq.js';
import { getAllLinks } from '../utils/links.js';

export const data = new SlashCommandBuilder()
  .setName('list')
  .setDescription('Get all...')
  .addSubcommand((command) => command
    .setName('questions')
    .setDescription('Get all questions'))
  .addSubcommand((command) => command
    .setName('links')
    .setDescription('Get all links'));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  let embed;

  if (interaction.options.getSubcommand() === 'questions') {
    embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Questions')
      .setDescription(getAllQuestions().map((question, index) => `${index + 1}. ${question}`).join('\n\n'));
  } else {
    embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Links')
      .setDescription(getAllLinks().map((link, index) => `${index + 1}. ${link}`).join('\n\n'));
  }

  await interaction.editReply({ embeds: [embed] });
}
