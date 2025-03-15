import type { Experience } from '@prisma/client';

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type GuildMember,
  inlineCode,
  roleMention,
  type User,
  userMention,
} from 'discord.js';

import type { Link } from '../lib/schemas/Link.js';
import type { Question } from '../lib/schemas/Question.js';

import {
  getFromRoleConfig,
  getInformation,
  getParticipants,
  getPrerequisites,
  getProfessors,
} from '../configuration/files.js';
import { getThemeColor } from '../configuration/main.js';
import { type Classroom } from '../lib/schemas/Classroom.js';
import { type CourseInformation } from '../lib/schemas/CourseInformation.js';
import { type CourseParticipants } from '../lib/schemas/CourseParticipants.js';
import { type CoursePrerequisites } from '../lib/schemas/CoursePrerequisites.js';
import { type CourseStaff } from '../lib/schemas/CourseStaff.js';
import { type Staff } from '../lib/schemas/Staff.js';
import { aboutMessage, botName } from '../translations/about.js';
import { commandDescriptions } from '../translations/commands.js';
import {
  embedMessageFunctions,
  embedMessages,
} from '../translations/embeds.js';
import { labels } from '../translations/labels.js';
import { paginationStringFunctions } from '../translations/pagination.js';
import { commandMention } from '../utils/commands.js';
import { getUsername } from '../utils/members.js';
import { linkStaff } from './utils.js';

export const getAboutEmbed = () =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(botName)
    .setDescription(
      aboutMessage(commandMention('help'), commandMention('list questions')),
    )
    .setTimestamp();

export const getClassroomEmbed = (information: Classroom) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(`${information.classroom.toString()} (${information.location})`)
    .addFields(
      {
        inline: true,
        name: labels.type,
        value: information.type,
      },
      {
        inline: true,
        name: labels.location,
        value: information.location,
      },
      {
        inline: true,
        name: labels.floor,
        value: information.floor.toString(),
      },
      {
        inline: true,
        name: labels.capacity,
        value: information.capacity.toString(),
      },
      {
        name: labels.description,
        value: information.description,
      },
    )
    .setTimestamp();

export const getCourseParticipantsEmbed = (information: CourseParticipants) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(information.course)
    .setDescription(embedMessages.courseParticipantsInfo)
    .addFields(
      ...Object.entries(information)
        .filter(([year]) => year !== 'course')
        .map(([year, participants]) => ({
          inline: true,
          name: year,
          value: participants.toString(),
        })),
    )
    .setTimestamp();

export const getCourseProfessorsEmbed = (information: CourseStaff) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(information.course)
    .setDescription(embedMessages.courseStaffInfo)
    .addFields(
      {
        inline: true,
        name: labels.professors,
        value: linkStaff(information.professors),
      },
      {
        inline: true,
        name: labels.assistants,
        value: linkStaff(information.assistants),
      },
    )
    .setTimestamp();

export const getCoursePrerequisiteEmbed = (information: CoursePrerequisites) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(information.course)
    .addFields({
      inline: true,
      name: labels.prerequisites,
      value:
        information.prerequisite === ''
          ? labels.none
          : information.prerequisite,
    })
    .setTimestamp();

export const getCourseInfoEmbed = (information: CourseInformation) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(information.course)
    .setDescription(embedMessages.courseInfo)
    .addFields(
      {
        inline: true,
        name: labels.accreditation,
        value: `[${labels.link}](${information.link})`,
      },
      {
        inline: true,
        name: labels.code === '' ? labels.unknown : labels.code,
        value: information.code,
      },
      {
        inline: true,
        name: labels.level === '' ? labels.unknown : labels.level,
        value: information.level.toString(),
      },
    )
    .setTimestamp();

export const getCourseSummaryEmbed = (course: string) => {
  const info = getInformation().find(
    (item) => item.course.toLowerCase() === course.toLowerCase(),
  );
  const prerequisite = getPrerequisites().find(
    (item) => item.course.toLowerCase() === course.toLowerCase(),
  );
  const professors = getProfessors().find(
    (item) => item.course.toLowerCase() === course.toLowerCase(),
  );
  const participants = getParticipants().find(
    (item) => item.course.toLowerCase() === course.toLowerCase(),
  );

  return [
    new EmbedBuilder()
      .setColor(getThemeColor())
      .setTitle(course)
      .setDescription(embedMessages.courseSummaryInfo),
    new EmbedBuilder()
      .setColor(getThemeColor())
      .setDescription(embedMessages.courseInfo)
      .addFields(
        {
          name: labels.prerequisites,
          value:
            prerequisite === undefined || prerequisite.prerequisite === ''
              ? labels.none
              : prerequisite.prerequisite,
        },
        {
          inline: true,
          name: labels.accreditation,
          value:
            info === undefined
              ? labels.unknown
              : `[${labels.link}](${info.link})`,
        },
        {
          inline: true,
          name: labels.code === '' ? labels.unknown : labels.code,
          value: info === undefined ? labels.unknown : info.code,
        },
        {
          inline: true,
          name: labels.level === '' ? labels.unknown : labels.level,
          value: info === undefined ? labels.unknown : info.level.toString(),
        },
      ),
    new EmbedBuilder()
      .setColor(getThemeColor())
      .setDescription(embedMessages.courseStaffInfo)
      .addFields(
        {
          inline: true,
          name: labels.professors,
          value:
            professors === undefined
              ? labels.unknown
              : linkStaff(professors.professors),
        },
        {
          inline: true,
          name: labels.assistants,
          value:
            professors === undefined
              ? labels.unknown
              : linkStaff(professors.assistants),
        },
      ),
    new EmbedBuilder()
      .setColor(getThemeColor())
      .setDescription(embedMessages.courseParticipantsInfo)
      .addFields(
        ...Object.entries(participants ?? {})
          .filter(([year]) => year !== 'course')
          .map(([year, part]) => ({
            inline: true,
            name: year,
            value: part.toString(),
          })),
      ),
  ];
};

export const getCoursesPrerequisiteEmbed = (course: string) => {
  const courses = getPrerequisites().filter((prerequisite) =>
    prerequisite.prerequisite.toLowerCase().includes(course.toLowerCase()),
  );

  return new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(`Предмети со предуслов ${course}`)
    .setDescription(
      courses.length === 0
        ? labels.none
        : courses
            .map(
              (prerequisite, index) =>
                `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                  prerequisite.course
                }`,
            )
            .join('\n'),
    )
    .setTimestamp();
};

export const getStaffEmbed = (information: Staff) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(information.name)
    .addFields(
      {
        inline: true,
        name: labels.title,
        value: information.title === '' ? labels.none : information.title,
      },
      {
        inline: true,
        name: labels.position,
        value: information.position === '' ? labels.none : information.position,
      },
      {
        inline: true,
        name: labels.cabinet.toString(),
        value:
          information.cabinet === ''
            ? labels.none
            : information.cabinet.toString(),
      },
      {
        name: labels.email,
        value: information.email === '' ? labels.none : information.email,
      },
      {
        inline: true,
        name: labels.finki,
        value:
          information.finki === ''
            ? labels.none
            : `[${labels.link}](${information.finki})`,
      },
      {
        inline: true,
        name: labels.courses,
        value:
          information.courses === ''
            ? labels.none
            : `[${labels.link}](${information.courses})`,
      },
      {
        inline: true,
        name: labels.timetable,
        value:
          information.raspored === ''
            ? labels.none
            : `[${labels.link}](${information.raspored})`,
      },
    )
    .setTimestamp();

export const getStudentInfoEmbed = (member: GuildMember) => {
  const yearRoles = getFromRoleConfig('year') ?? [];
  const programRoles = getFromRoleConfig('program') ?? [];
  const colorRoles = getFromRoleConfig('color') ?? [];
  const levelRoles = getFromRoleConfig('level') ?? [];

  const yearRole = member.roles.cache.find((role) =>
    yearRoles.includes(role.name),
  );
  const programRole = member.roles.cache.find((role) =>
    programRoles.includes(role.name),
  );
  const colorRole = member.roles.cache.find((role) =>
    colorRoles.includes(role.name),
  );
  const levelRole = member.roles.cache.find((role) =>
    levelRoles.includes(role.name),
  );
  const notificationRoles = member.roles.cache
    .filter((role) =>
      (getFromRoleConfig('notification') ?? []).includes(role.name),
    )
    .map((role) => roleMention(role.id))
    .join('\n');
  const courseRoles = member.roles.cache
    .filter((role) =>
      Object.keys(getFromRoleConfig('courses') ?? []).includes(role.name),
    )
    .map((role) => roleMention(role.id))
    .join('\n');
  const other = member.roles.cache
    .filter((role) => (getFromRoleConfig('other') ?? []).includes(role.name))
    .map((role) => roleMention(role.id))
    .join('\n');

  return new EmbedBuilder()
    .setColor(getThemeColor())
    .setAuthor({
      iconURL: member.user.displayAvatarURL(),
      name: member.user.tag,
    })
    .setTitle(embedMessages.studentInformation)
    .addFields(
      {
        inline: true,
        name: labels.year,
        value: yearRole === undefined ? labels.none : roleMention(yearRole.id),
      },
      {
        inline: true,
        name: labels.program,
        value:
          programRole === undefined ? labels.none : roleMention(programRole.id),
      },
      {
        inline: true,
        name: labels.color,
        value:
          colorRole === undefined ? labels.none : roleMention(colorRole.id),
      },
      {
        inline: true,
        name: labels.level,
        value:
          levelRole === undefined ? labels.none : roleMention(levelRole.id),
      },
      {
        inline: true,
        name: labels.notifications,
        value: notificationRoles === '' ? labels.none : notificationRoles,
      },
      {
        name: labels.courses,
        value: courseRoles === '' ? labels.none : courseRoles,
      },
      {
        name: labels.other,
        value: other === '' ? labels.none : other,
      },
    )
    .setTimestamp();
};

export const getExperienceEmbed = (experience: Experience, user: User) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setAuthor({
      iconURL: user.displayAvatarURL(),
      name: user.tag,
    })
    .setTitle(labels.activity)
    .addFields(
      {
        inline: true,
        name: labels.level,
        value: experience.level.toString(),
      },
      {
        inline: true,
        name: labels.points,
        value: experience.experience.toString(),
      },
    )
    .setTimestamp();

export const getExperienceLeaderboardFirstPageEmbed = async (
  experience: Experience[],
  all: number,
  perPage = 8,
) => {
  const total = experience.length;

  return new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(labels.activity)
    .addFields(
      await Promise.all(
        experience.slice(0, perPage).map(async (exp, index) => ({
          name: '\u200B',
          value: `${index + 1}. ${inlineCode(await getUsername(exp.userId))} (${userMention(
            exp.userId,
          )}): ${labels.level}: ${exp.level} | ${labels.points}: ${
            exp.experience
          }`,
        })),
      ),
    )
    .setFooter({
      text: paginationStringFunctions.membersPage(
        1,
        Math.max(1, Math.ceil(total / perPage)),
        all,
      ),
    })
    .setTimestamp();
};

export const getExperienceLeaderboardNextPageEmbed = async (
  experience: Experience[],
  page: number,
  all: number,
  perPage = 8,
) => {
  const total = experience.length;

  return new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(labels.activity)
    .addFields(
      await Promise.all(
        experience
          .slice(perPage * page, perPage * (page + 1))
          .map(async (exp, index) => ({
            name: '\u200B',
            value: `${perPage * page + index + 1}. ${inlineCode(
              await getUsername(exp.userId),
            )} (${userMention(exp.userId)}): ${labels.level}: ${exp.level} | ${
              labels.points
            }: ${exp.experience}`,
          })),
      ),
    )
    .setFooter({
      text: paginationStringFunctions.membersPage(
        page + 1,
        Math.max(1, Math.ceil(total / perPage)),
        all,
      ),
    })
    .setTimestamp();
};

// Questions & links

export const getQuestionEmbed = (question: Question) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(question.name)
    .setDescription(question.content)
    .setTimestamp();

export const getQuestionComponents = (question: Question) => {
  const components: Array<ActionRowBuilder<ButtonBuilder>> = [];

  if (question.links === null) {
    return components;
  }

  const links = Object.entries(question.links);

  for (let index1 = 0; index1 < links.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      const [name, url] = links[index2] ?? [];
      if (
        name === undefined ||
        url === undefined ||
        name === '' ||
        url === ''
      ) {
        break;
      }

      const button = new ButtonBuilder()
        .setURL(url.startsWith('http') ? url : `https://${url}`)
        .setLabel(name)
        .setStyle(ButtonStyle.Link);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getLinkEmbed = (link: Link) => {
  const embed = new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(link.name)
    .setTimestamp();

  if (link.description !== null) {
    embed.setDescription(link.description);
  }

  return embed;
};

export const getLinkComponents = (link: Link) => [
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setURL(link.url.startsWith('http') ? link.url : `https://${link.url}`)
      .setLabel(labels.link)
      .setStyle(ButtonStyle.Link),
  ),
];

export const getListQuestionsEmbed = (questions: Question[]) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(labels.questions)
    .setDescription(
      `${embedMessageFunctions.allQuestions(
        commandMention('faq'),
      )}\n\n${questions
        .map(
          (question, index) =>
            `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
              question.name
            }`,
        )
        .join('\n')}`,
    )
    .setTimestamp();

export const getListLinksEmbed = (links: Link[]) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(labels.links)
    .setDescription(
      `${embedMessageFunctions.allLinks(commandMention('link'))}\n\n${links
        .map(
          (link, index) =>
            `${inlineCode((index + 1).toString().padStart(2, '0'))} [${
              link.name
            }](${link.url})`,
        )
        .join('\n')}`,
    )
    .setTimestamp();

export const getHelpEmbed = (
  commands: string[],
  page: number,
  commandsPerPage = 8,
) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(labels.commands)
    .setDescription(embedMessages.allCommands)
    .addFields(
      ...commands
        .slice(commandsPerPage * page, commandsPerPage * (page + 1))
        .map((command) => ({
          name: commandMention(command),
          value:
            commandDescriptions[command as keyof typeof commandDescriptions],
        })),
    )
    .setFooter({
      text: paginationStringFunctions.commandPage(
        page + 1,
        Math.max(1, Math.ceil(commands.length / commandsPerPage)),
        commands.length,
      ),
    })
    .setTimestamp();
