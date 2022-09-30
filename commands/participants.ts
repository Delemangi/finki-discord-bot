import { readFile } from 'node:fs/promises';
import { parse } from 'csv/sync';
import {
  type ChatInputCommandInteraction,
  type Role,
  roleMention,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { isTextGuildBased } from '../utils/functions.js';
import { CommandsDescription } from '../utils/strings.js';

const choices = ['2022/2023', '2021/2022', '2020/2021', '2019/2020', '2018/2019'];
const csv: string[][] = parse(await readFile('config/participants.csv', 'utf8'), { delimiter: ';' });
const mapping = {
  '2016/2017': 7,
  '2017/2018': 6,
  '2018/2019': 5,
  '2019/2020': 4,
  '2020/2021': 3,
  '2021/2022': 2,
  '2022/2023': 1
};

export const data = new SlashCommandBuilder()
  .setName('participants')
  .setDescription('Participants')
  .addSubcommand((command) => command
    .setName('role')
    .setDescription(CommandsDescription['participant role'])
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Role')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('course')
    .setDescription(CommandsDescription['participant course'])
    .addStringOption((option) => option
      .setName('course')
      .setDescription('The course to get the participants for')
      .setRequired(true)
      .setAutocomplete(true))
    .addStringOption((option) => option
      .setName('year')
      .setDescription('The year of the course')
      .setRequired(false)
      .addChoices(...choices.map((choice) => ({
        name: choice,
        value: choice
      })))));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  if (interaction.options.getSubcommand(true) === 'role') {
    const guild = interaction.guild;
    const role = interaction.options.getRole('role') as Role;

    if (!isTextGuildBased(interaction.channel) || guild === null) {
      await interaction.editReply('You cannot use this command here.');
      return;
    }

    await guild.members.fetch();

    await interaction.editReply({
      allowedMentions: { parse: [] },
      content: `${roleMention(role.id)}: ${role.members.size}`
    });
  } else {
    const course = interaction.options.getString('course', true);
    const year = interaction.options.getString('year');
    const info = csv.find((entry) => entry.at(0) === course);

    if (info === undefined) {
      await interaction.editReply('No such course exists.');
      return;
    }

    if (year === null) {
      const counts: { [index: string]: string } = {};

      for (const [courseYear, index] of Object.entries(mapping)) {
        counts[courseYear] = info[index] ?? '?';
      }

      const embed = new EmbedBuilder()
        .setColor(getFromBotConfig('color'))
        .setTitle(course)
        .addFields(...Object.entries(counts).map((count) => ({
          inline: true,
          name: count[0],
          value: count[1]
        })).reverse())
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(course)
        .addFields({
          inline: true,
          name: year,
          // @ts-expect-error The key always exists in the object
          value: info[mapping[year]] ?? '?'
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  }
}
