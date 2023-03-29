import {
  getFromRoleConfig,
  getInformation,
  getParticipants,
  getPrerequisites,
  getProfessors,
} from '../utils/config.js';
import {
  getCourseInfoEmbed,
  getCourseParticipantsEmbed,
  getCoursePrerequisiteEmbed,
  getCourseProfessorsEmbed,
  getCourseSummaryEmbed,
} from '../utils/embeds.js';
import { getCourseRoleByCourseName } from '../utils/roles.js';
import { commands, errors } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  roleMention,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'course';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Course')
  .addSubcommand((command) =>
    command
      .setName('participants')
      .setDescription(commands['course participants'])
      .addStringOption((option) =>
        option
          .setName('course')
          .setDescription('Предмет')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('professors')
      .setDescription(commands['course professors'])
      .addStringOption((option) =>
        option
          .setName('course')
          .setDescription('Предмет')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('role')
      .setDescription(commands['course role'])
      .addStringOption((option) =>
        option
          .setName('courserole')
          .setDescription('Предмет')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('prerequisite')
      .setDescription(commands['course prerequisite'])
      .addStringOption((option) =>
        option
          .setName('course')
          .setDescription('Предмет')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('info')
      .setDescription(commands['course info'])
      .addStringOption((option) =>
        option
          .setName('course')
          .setDescription('Предмет')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('summary')
      .setDescription(commands['course summary'])
      .addStringOption((option) =>
        option
          .setName('course')
          .setDescription('Предмет')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('toggle')
      .setDescription(commands['course toggle'])
      .addStringOption((option) =>
        option
          .setName('courserole')
          .setDescription('Предмет')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  );

const handleCourseParticipants = async (
  interaction: ChatInputCommandInteraction,
  course: string | null,
) => {
  const information = getParticipants().find(
    (participants) =>
      participants.course.toLowerCase() === course?.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(errors.courseNotFound);
    return;
  }

  const embed = getCourseParticipantsEmbed(information);
  await interaction.editReply({ embeds: [embed] });
};

const handleCourseProfessors = async (
  interaction: ChatInputCommandInteraction,
  course: string | null,
) => {
  const information = getProfessors().find(
    (staff) => staff.course.toLowerCase() === course?.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(errors.courseNotFound);
    return;
  }

  const embed = getCourseProfessorsEmbed(information);
  await interaction.editReply({ embeds: [embed] });
};

const handleCourseRole = async (
  interaction: ChatInputCommandInteraction,
  courseRole: string | null,
) => {
  if (interaction.guild === null) {
    await interaction.editReply(errors.serverOnlyCommand);
    return;
  }

  await interaction.guild.members.fetch();

  const roleEntry = Object.entries(getFromRoleConfig('courses')).find(
    ([, course]) => course.toLowerCase() === courseRole?.toLowerCase(),
  );

  if (roleEntry === undefined) {
    await interaction.editReply(errors.courseNotFound);
    return;
  }

  const role = interaction.guild.roles.cache.find(
    (ro) => ro.name.toLowerCase() === roleEntry[0].toLowerCase(),
  );

  if (role === undefined) {
    await interaction.editReply(errors.courseNotFound);
    return;
  }

  await interaction.editReply({
    allowedMentions: { parse: [] },
    content: `${roleMention(role.id)}: ${role.members.size}`,
  });
};

const handleCoursePrerequisite = async (
  interaction: ChatInputCommandInteraction,
  course: string | null,
) => {
  const information = getPrerequisites().find(
    (prerequisites) =>
      prerequisites.course.toLowerCase() === course?.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(errors.courseNotFound);
    return;
  }

  const embed = getCoursePrerequisiteEmbed(information);
  await interaction.editReply({ embeds: [embed] });
};

const handleCourseInfo = async (
  interaction: ChatInputCommandInteraction,
  course: string | null,
) => {
  const information = getInformation().find(
    (info) => info.course.toLowerCase() === course?.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(errors.courseNotFound);
    return;
  }

  const embed = getCourseInfoEmbed(information);
  await interaction.editReply({ embeds: [embed] });
};

const handleCourseSummary = async (
  interaction: ChatInputCommandInteraction,
  course: string | null,
) => {
  const embeds = getCourseSummaryEmbed(course);
  await interaction.editReply({ embeds });
};

const handleCourseToggle = async (
  interaction: ChatInputCommandInteraction,
  course: string | null,
) => {
  if (interaction.guild === null) {
    await interaction.editReply(errors.serverOnlyCommand);
    return;
  }

  const member = interaction.member as GuildMember;
  const role = getCourseRoleByCourseName(interaction.guild, course);

  if (role === undefined) {
    await interaction.editReply(errors.courseNotFound);
    return;
  }

  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    await interaction.editReply({
      allowedMentions: { parse: [] },
      content: `Го отстранивте предметот ${roleMention(role.id)}.`,
    });
    return;
  }

  await member.roles.add(role);
  await interaction.editReply({
    allowedMentions: { parse: [] },
    content: `Го земавте предметот ${roleMention(role.id)}.`,
  });
};

const courseHandlers = {
  info: handleCourseInfo,
  participants: handleCourseParticipants,
  prerequisite: handleCoursePrerequisite,
  professors: handleCourseProfessors,
  role: handleCourseRole,
  summary: handleCourseSummary,
  toggle: handleCourseToggle,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const course = interaction.options.getString('course');
  const courseRole = interaction.options.getString('courserole');

  if (
    course?.toLowerCase() === 'спорт и здравје' ||
    courseRole?.toLowerCase() === 'спорт и здравје'
  ) {
    await interaction.editReply('Добар обид.');
    return;
  }

  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(courseHandlers).includes(subcommand)) {
    await courseHandlers[subcommand as keyof typeof courseHandlers](
      interaction,
      course ?? courseRole,
    );
  }
};
