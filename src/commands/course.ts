import {
  getCourseInfoEmbed,
  getCourseParticipantsEmbed,
  getCoursePrerequisiteEmbed,
  getCourseProfessorsEmbed,
  getCourseSummaryEmbed,
} from '../components/commands.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import {
  getCourses,
  getFromRoleConfig,
  getInformation,
  getParticipants,
  getPrerequisites,
  getProfessors,
} from '../utils/config.js';
import { getGuild } from '../utils/guild.js';
import { getCourseRoleByCourseName } from '../utils/roles.js';
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
      .setDescription(commandDescriptions['course participants'])
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
      .setDescription(commandDescriptions['course professors'])
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
      .setDescription(commandDescriptions['course role'])
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
      .setDescription(commandDescriptions['course prerequisite'])
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
      .setDescription(commandDescriptions['course info'])
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
      .setDescription(commandDescriptions['course summary'])
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
      .setDescription(commandDescriptions['course toggle'])
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
  course: null | string,
) => {
  const information = getParticipants().find(
    (participants) =>
      participants.course.toLowerCase() === course?.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  const embed = await getCourseParticipantsEmbed(information);
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleCourseProfessors = async (
  interaction: ChatInputCommandInteraction,
  course: null | string,
) => {
  const information = getProfessors().find(
    (staff) => staff.course.toLowerCase() === course?.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  const embed = await getCourseProfessorsEmbed(information);
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleCourseRole = async (
  interaction: ChatInputCommandInteraction,
  courseRole: null | string,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  await guild.members.fetch();

  const roleEntry = Object.entries(getFromRoleConfig('courses')).find(
    ([, course]) => course.toLowerCase() === courseRole?.toLowerCase(),
  );

  if (roleEntry === undefined) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  const role = guild.roles.cache.find(
    (ro) => ro.name.toLowerCase() === roleEntry[0].toLowerCase(),
  );

  if (role === undefined) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  await interaction.editReply({
    allowedMentions: {
      parse: [],
    },
    content: `${roleMention(role.id)}: ${role.members.size}`,
  });
};

const handleCoursePrerequisite = async (
  interaction: ChatInputCommandInteraction,
  course: null | string,
) => {
  const information = getPrerequisites().find(
    (prerequisites) =>
      prerequisites.course.toLowerCase() === course?.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  const embed = await getCoursePrerequisiteEmbed(information);
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleCourseInfo = async (
  interaction: ChatInputCommandInteraction,
  course: null | string,
) => {
  const information = getInformation().find(
    (info) => info.course.toLowerCase() === course?.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  const embed = await getCourseInfoEmbed(information);
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleCourseSummary = async (
  interaction: ChatInputCommandInteraction,
  course: null | string,
) => {
  if (course === null || !getCourses().includes(course)) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  const embeds = await getCourseSummaryEmbed(course);
  await interaction.editReply({
    embeds,
  });
};

const handleCourseToggle = async (
  interaction: ChatInputCommandInteraction,
  course: null | string,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  if (course === null) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  const member = interaction.member as GuildMember;
  const role = getCourseRoleByCourseName(guild, course);

  if (role === null) {
    await interaction.editReply(commandErrors.courseNotFound);

    return;
  }

  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    await interaction.editReply({
      allowedMentions: {
        parse: [],
      },
      content: commandResponseFunctions.courseRemoved(role.id),
    });

    return;
  }

  await member.roles.add(role);
  await interaction.editReply({
    allowedMentions: {
      parse: [],
    },
    content: commandResponseFunctions.courseAdded(role.id),
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

  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand in courseHandlers) {
    await courseHandlers[subcommand as keyof typeof courseHandlers](
      interaction,
      course ?? courseRole,
    );
  }
};
