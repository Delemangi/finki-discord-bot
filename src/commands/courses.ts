import {
  type ChatInputCommandInteraction,
  type GuildMember,
  SlashCommandBuilder,
} from 'discord.js';

import { getCoursesPrerequisiteEmbed } from '../components/commands.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from '../translations/commands.js';
import { getGuild } from '../utils/guild.js';
import { getCourseRolesBySemester, getRoles } from '../utils/roles.js';

const name = 'courses';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Get all...')
  .addSubcommand((command) =>
    command
      .setName('prerequisite')
      .setDescription(commandDescriptions['courses prerequisite'])
      .addStringOption((option) =>
        option
          .setName('course')
          .setDescription('Курс')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('add')
      .setDescription(commandDescriptions['courses add'])
      .addNumberOption((option) =>
        option
          .setName('semester')
          .setDescription('Семестар')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(8),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('remove')
      .setDescription(commandDescriptions['courses remove'])
      .addNumberOption((option) =>
        option
          .setName('semester')
          .setDescription('Семестар')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(8),
      ),
  );

const handleCoursesPrerequisite = async (
  interaction: ChatInputCommandInteraction,
) => {
  const course = interaction.options.getString('course', true);

  const embed = getCoursesPrerequisiteEmbed(course);
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleCoursesAdd = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const semester = interaction.options.getNumber('semester');
  const member = interaction.member as GuildMember;
  const roles =
    semester === null
      ? getRoles(guild, 'courses')
      : getCourseRolesBySemester(guild, semester);

  await member.roles.add(roles);
  await interaction.editReply(
    semester === null
      ? commandResponses.allSemestersCoursesAdded
      : commandResponseFunctions.semesterCoursesAdded(semester),
  );
};

const handleCoursesRemove = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const semester = interaction.options.getNumber('semester');
  const member = interaction.member as GuildMember;
  const roles =
    semester === null
      ? getRoles(guild, 'courses')
      : getCourseRolesBySemester(guild, semester);

  await member.roles.remove(roles);
  await interaction.editReply(
    semester === null
      ? commandResponses.allSemestersCoursesRemoved
      : commandResponseFunctions.semesterCoursesRemoved(semester),
  );
};

const coursesHandlers = {
  add: handleCoursesAdd,
  prerequisite: handleCoursesPrerequisite,
  remove: handleCoursesRemove,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand in coursesHandlers) {
    await coursesHandlers[subcommand as keyof typeof coursesHandlers](
      interaction,
    );
  }
};
