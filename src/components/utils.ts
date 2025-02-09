import {
  type ButtonInteraction,
  channelMention,
  type ChatInputCommandInteraction,
  inlineCode,
  type Interaction,
  type MessageContextMenuCommandInteraction,
  roleMention,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

import { getStaff } from '../configuration/files.js';
import { logger } from '../logger.js';
import { embedLabels } from '../translations/embeds.js';
import { labels } from '../translations/labels.js';
import { logErrorFunctions } from '../translations/logs.js';
import { getRoleFromSet } from '../utils/roles.js';

export const truncateString = (
  string: null | string | undefined,
  length = 100,
) => {
  if (string === null || string === undefined) {
    return '';
  }

  return string.length > length
    ? `${string.slice(0, Math.max(0, length - 3))}...`
    : string;
};

export const getChannelMention = (interaction: Interaction) => {
  if (interaction.channel === null || interaction.channel.isDMBased()) {
    return labels.dm;
  }

  return channelMention(interaction.channel.id);
};

export const getButtonCommand = (command: string) => {
  switch (command) {
    case 'addCourses':
      return embedLabels.addCourses;

    case 'pollStats':
      return embedLabels.pollStats;

    case 'removeCourses':
      return embedLabels.removeCourses;

    case 'ticketClose':
      return embedLabels.ticketClose;

    case 'ticketCreate':
      return embedLabels.ticketCreate;

    default:
      return command.slice(0, 1).toUpperCase() + command.slice(1);
  }
};

export const getButtonInfo = (
  interaction: ButtonInteraction,
  command: string,
  args: string[],
) => {
  switch (command) {
    case 'addCourses':
    case 'exp':
    case 'help':
    case 'poll':
    case 'polls':
    case 'pollStats':
    case 'removeCourses':
    case 'ticketClose':
    case 'ticketCreate':
    case 'vip':
      return {
        name: getButtonCommand(command),
        value:
          args[0] === undefined ? embedLabels.unknown : inlineCode(args[0]),
      };

    case 'color':
    case 'notification':
    case 'program':
    case 'year':
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
  interaction:
    | ChatInputCommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction,
) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    return null;
  }

  try {
    const { url } = await interaction.fetchReply();

    return {
      url,
    };
  } catch (error) {
    logger.warn(logErrorFunctions.messageUrlFetchError(interaction.id, error));

    return null;
  }
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
