import {
  getFromRoleConfig,
  getInformation,
  getParticipants,
  getPrerequisites,
  getProfessors
} from '../utils/config.js';
import {
  getCourseInfoEmbed,
  getCourseParticipantsEmbed,
  getCoursePrerequisiteEmbed,
  getCourseProfessorsEmbed,
  getCourseSummaryEmbed
} from '../utils/embeds.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder
} from 'discord.js';

const name = 'course';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Course')
  .addSubcommand((command) => command
    .setName('participants')
    .setDescription(commands['course participants'])
    .addStringOption((option) => option
      .setName('course')
      .setDescription('Предмет')
      .setRequired(true)
      .setAutocomplete(true)))
  .addSubcommand((command) => command
    .setName('professors')
    .setDescription(commands['course professors'])
    .addStringOption((option) => option
      .setName('course')
      .setDescription('Предмет')
      .setRequired(true)
      .setAutocomplete(true)))
  .addSubcommand((command) => command
    .setName('role')
    .setDescription(commands['course role'])
    .addStringOption((option) => option
      .setName('courserole')
      .setDescription('Предмет')
      .setRequired(true)
      .setAutocomplete(true)))
  .addSubcommand((command) => command
    .setName('prerequisite')
    .setDescription(commands['course prerequisite'])
    .addStringOption((option) => option
      .setName('course')
      .setDescription('Предмет')
      .setRequired(true)
      .setAutocomplete(true)))
  .addSubcommand((command) => command
    .setName('info')
    .setDescription(commands['course info'])
    .addStringOption((option) => option
      .setName('course')
      .setDescription('Предмет')
      .setRequired(true)
      .setAutocomplete(true)))
  .addSubcommand((command) => command
    .setName('summary')
    .setDescription(commands['course summary'])
    .addStringOption((option) => option
      .setName('course')
      .setDescription('Предмет')
      .setRequired(true)
      .setAutocomplete(true)));

export async function execute (interaction: ChatInputCommandInteraction) {
  const course = interaction.options.getString('course');
  const courseRole = interaction.options.getString('courserole');

  if (course?.toLowerCase() === 'спорт и здравје' || courseRole?.toLowerCase() === 'спорт и здравје') {
    await interaction.editReply('Добар обид.');
    return;
  }

  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand === 'participants') {
    await handleCourseParticipants(interaction, course);
  } else if (subcommand === 'professors') {
    await handleCourseProfessors(interaction, course);
  } else if (subcommand === 'role') {
    await handleCourseRole(interaction, courseRole);
  } else if (subcommand === 'prerequisite') {
    await handleCoursePrerequisite(interaction, course);
  } else if (subcommand === 'info') {
    await handleCourseInfo(interaction, course);
  } else if (subcommand === 'summary') {
    await handleCourseSummary(interaction, course);
  }
}

async function handleCourseParticipants (interaction: ChatInputCommandInteraction, course: string | null) {
  const information = getParticipants().find((p) => p.course.toLowerCase() === course?.toLowerCase());

  if (information === undefined) {
    await interaction.editReply('Не постои таков предмет.');
    return;
  }

  const embed = getCourseParticipantsEmbed(information);
  await interaction.editReply({ embeds: [embed] });
}

async function handleCourseProfessors (interaction: ChatInputCommandInteraction, course: string | null) {
  const information = getProfessors().find((p) => p.course.toLowerCase() === course?.toLowerCase());

  if (information === undefined) {
    await interaction.editReply('Не постои таков предмет.');
    return;
  }

  const embed = getCourseProfessorsEmbed(information);
  await interaction.editReply({ embeds: [embed] });
}

async function handleCourseRole (interaction: ChatInputCommandInteraction, courseRole: string | null) {
  if (interaction.guild === null) {
    await interaction.editReply('Оваа команда се повикува само во сервер.');
    return;
  }

  await interaction.guild.members.fetch();

  const roleEntry = Object.entries(getFromRoleConfig('courses')).find(([, c]) => c.toLowerCase() === courseRole?.toLowerCase());

  if (roleEntry === undefined) {
    await interaction.editReply('Не постои таков предмет.');
    return;
  }

  const role = interaction.guild.roles.cache.find((r) => r.name.toLowerCase() === roleEntry[0].toLowerCase());

  if (role === undefined) {
    await interaction.editReply('Не постои таков предмет.');
    return;
  }

  await interaction.editReply({
    allowedMentions: { parse: [] },
    content: `${roleMention(role.id)}: ${role.members.size}`
  });
}

async function handleCoursePrerequisite (interaction: ChatInputCommandInteraction, course: string | null) {
  const information = getPrerequisites().find((p) => p.course.toLowerCase() === course?.toLowerCase());

  if (information === undefined) {
    await interaction.editReply('Не постои таков предмет.');
    return;
  }

  const embed = getCoursePrerequisiteEmbed(information);
  await interaction.editReply({ embeds: [embed] });
}

async function handleCourseInfo (interaction: ChatInputCommandInteraction, course: string | null) {
  const information = getInformation().find((p) => p.course.toLowerCase() === course?.toLowerCase());

  if (information === undefined) {
    await interaction.editReply('Не постои таков предмет.');
    return;
  }

  const embed = getCourseInfoEmbed(information);
  await interaction.editReply({ embeds: [embed] });
}

async function handleCourseSummary (interaction: ChatInputCommandInteraction, course: string | null) {
  const embed = getCourseSummaryEmbed(course);
  await interaction.editReply({ embeds: [embed] });
}
