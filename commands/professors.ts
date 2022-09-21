import { readFile } from 'node:fs/promises';
import { parse } from 'csv/sync';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';

const csv: string[][] = parse(await readFile('config/professors.csv', 'utf8'), { delimiter: ';' });

export const data = new SlashCommandBuilder()
  .setName('professors')
  .setDescription('Professors')
  .addStringOption((option) => option
    .setName('course')
    .setDescription('The course to get the professors for')
    .setRequired(true)
    .setAutocomplete(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const course = interaction.options.getString('course', true);
  const info = csv.find((entry) => entry.at(0) === course);

  if (info === undefined) {
    await interaction.editReply('No such course exists.');
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(course)
    .addFields({
      inline: true,
      name: 'Професори',
      value: info[1] ?? 'None'
    },
    {
      inline: true,
      name: 'Асистенти',
      value: info[2] ?? 'None'
    })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
