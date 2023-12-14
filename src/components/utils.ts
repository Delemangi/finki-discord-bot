import { embedLabels } from '../translations/embeds.js';
import { labels } from '../translations/labels.js';
import { logErrorFunctions } from '../translations/logs.js';
import { type ProgramShorthand } from '../types/ProgramShorthand.js';
import { getPrerequisites, getStaff } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { getRoleFromSet } from '../utils/roles.js';
import {
  type ButtonInteraction,
  channelMention,
  type ChatInputCommandInteraction,
  inlineCode,
  type Interaction,
  roleMention,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

export const truncateString = (
  string: string | null | undefined,
  length: number,
) => {
  if (string === null || string === undefined) {
    return '';
  }

  return string.length > length
    ? string.slice(0, Math.max(0, length - 3)) + '...'
    : string;
};

export const getChannelMention = (interaction: Interaction) => {
  if (interaction.channel === null || interaction.channel.isDMBased()) {
    return labels.dm;
  }

  return channelMention(interaction.channel.id);
};

export const getButtonCommand = (command?: string) => {
  switch (command) {
    case undefined:
      return embedLabels.unknown;

    case 'pollStats':
      return embedLabels.pollStats;

    default:
      return command[0]?.toUpperCase() + command.slice(1);
  }
};

// eslint-disable-next-line complexity
export const getButtonInfo = (
  interaction: ButtonInteraction,
  command: string,
  args: string[],
) => {
  switch (command) {
    case 'course':
      return {
        name: getButtonCommand(command),
        value:
          interaction.guild && args[0]
            ? roleMention(
                getRoleFromSet(interaction.guild, 'courses', args[0])?.id ??
                  embedLabels.unknown,
              )
            : embedLabels.unknown,
      };

    case 'year':
    case 'program':
    case 'notification':
    case 'color':
      return {
        name: getButtonCommand(command),
        value:
          interaction.guild && args[0]
            ? roleMention(
                getRoleFromSet(interaction.guild, command, args[0])?.id ??
                  embedLabels.unknown,
              )
            : embedLabels.unknown,
      };

    case 'help':
    case 'exp':
    case 'polls':
    case 'poll':
    case 'pollStats':
    case 'addCourses':
    case 'removeCourses':
    case 'vip':
      return {
        name: getButtonCommand(command),
        value:
          args[0] === undefined ? embedLabels.unknown : inlineCode(args[0]),
      };

    default:
      return {
        name: embedLabels.unknown,
        value: embedLabels.unknown,
      };
  }
};

export const linkProfessors = (professors: string) => {
  if (professors === '') {
    return labels.none;
  }

  return professors
    .split('\n')
    .map((professor) => [
      professor,
      getStaff().find((staff) => professor.includes(staff.name))?.finki,
    ])
    .map(([professor, finki]) =>
      finki ? `[${professor}](${finki})` : professor,
    )
    .join('\n');
};

export const fetchMessageUrl = async (
  interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction,
) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    return null;
  }

  try {
    return {
      url: (await interaction.fetchReply()).url,
    };
  } catch (error) {
    logger.warn(logErrorFunctions.messageUrlFetchError(interaction.id, error));

    return null;
  }
};

export const transformCoursePrerequisites = (
  program: ProgramShorthand,
  semester: number,
) => {
  return getPrerequisites()
    .filter((prerequisite) => prerequisite.semester === semester)
    .filter(
      (prerequisite) =>
        prerequisite[program] === 'задолжителен' ||
        prerequisite[program] === 'изборен' ||
        prerequisite[program] === 'нема' ||
        prerequisite[program] === 'задолжителен (изб.)',
    )
    .map((prerequisite) =>
      prerequisite[program] === 'нема'
        ? {
            course: prerequisite.course,
            prerequisite: labels.none,
            type: 'изборен',
          }
        : {
            course: prerequisite.course,
            prerequisite: prerequisite.prerequisite,
            type: prerequisite[program],
          },
    );
};

export const generatePollPercentageBar = (percentage: number) => {
  if (percentage === 0) {
    return '.'.repeat(20);
  }

  const progressBar =
    '█'.repeat(Math.floor(percentage / 5)) +
    (percentage - Math.floor(percentage) >= 0.5 ? '▌' : '');

  return progressBar + '.'.repeat(Math.max(0, 20 - progressBar.length));
};
