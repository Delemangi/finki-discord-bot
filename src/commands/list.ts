import {
  getListLinksEmbed,
  getListQuestionsEmbed
} from '../utils/embeds.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

const name = 'list';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Get all...')
  .addSubcommand((command) => command
    .setName('questions')
    .setDescription(commands['list questions']))
  .addSubcommand((command) => command
    .setName('links')
    .setDescription(commands['list links']));

export async function execute (interaction: ChatInputCommandInteraction) {
  if (interaction.options.getSubcommand(true) === 'questions') {
    await handleListQuestions(interaction);
  } else if (interaction.options.getSubcommand(true) === 'links') {
    await handleListLinks(interaction);
  }
}

async function handleListQuestions (interaction: ChatInputCommandInteraction) {
  const embed = getListQuestionsEmbed();
  await interaction.editReply({ embeds: [embed] });
}

async function handleListLinks (interaction: ChatInputCommandInteraction) {
  const embed = getListLinksEmbed();
  await interaction.editReply({ embeds: [embed] });
}

