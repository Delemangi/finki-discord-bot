import { readFile } from 'node:fs/promises';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { commands } from '../utils/strings.js';

const emails: { [index: string]: string } = JSON.parse(await readFile('config/emails.json', 'utf8'));

const command = 'email';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(commands[command])
  .addStringOption((option) => option
    .setName('professor')
    .setDescription('The professor to get the email for')
    .setRequired(true)
    .setAutocomplete(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const professor = interaction.options.getString('professor', true);

  if (!(professor in emails)) {
    await interaction.editReply('No such professor exists.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(professor)
    .setDescription(emails[professor] ?? '?')
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
