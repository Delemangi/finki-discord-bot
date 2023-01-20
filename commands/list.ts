import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { getAllQuestions } from '../utils/faq.js';
import { commandMention } from '../utils/functions.js';
import { getAllLinks } from '../utils/links.js';
import { CommandsDescription } from '../utils/strings.js';

export const data = new SlashCommandBuilder()
  .setName('list')
  .setDescription('Get all...')
  .addSubcommand((command) => command
    .setName('questions')
    .setDescription(CommandsDescription['list questions']))
  .addSubcommand((command) => command
    .setName('links')
    .setDescription(CommandsDescription['list links']));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  let embed;

  if (interaction.options.getSubcommand() === 'questions') {
    embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Прашања')
      .setDescription(`Ова се сите достапни прашања. Користете ${commandMention('faq')} за да ги добиете одговорите.\n\n${getAllQuestions().map((question, index) => `${(index + 1).toString().padStart(2, '0')}. ${question}`).join('\n')}`)
      .setTimestamp();
  } else {
    embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Линкови')
      .setDescription(`Ова се сите достапни линкови. Користете ${commandMention('link')} за да ги добиете линковите.\n\n${getAllLinks().map((link, index) => `${(index + 1).toString().padStart(2, '0')}. ${link}`).join('\n')}`)
      .setTimestamp();
  }

  await interaction.editReply({ embeds: [embed] });
}
