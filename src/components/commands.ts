import { aboutMessage, botName } from '../translations/about.js';
import { commandDescriptions } from '../translations/commands.js';
import {
  embedMessageFunctions,
  embedMessages,
} from '../translations/embeds.js';
import { labels } from '../translations/labels.js';
import { paginationStringFunctions } from '../translations/pagination.js';
import { programMapping } from '../translations/programs.js';
import { type Classroom } from '../types/Classroom.js';
import { type CourseInformation } from '../types/CourseInformation.js';
import { type CourseParticipants } from '../types/CourseParticipants.js';
import { type CoursePrerequisites } from '../types/CoursePrerequisites.js';
import { type CourseStaff } from '../types/CourseStaff.js';
import { type ProgramName } from '../types/ProgramName.js';
import { type QuestionWithLinks } from '../types/QuestionWithLinks.js';
import { type Staff } from '../types/Staff.js';
import { client } from '../utils/client.js';
import { commandMention } from '../utils/commands.js';
import {
  getConfigProperty,
  getFromRoleConfig,
  getInformation,
  getParticipants,
  getPrerequisites,
  getProfessors,
} from '../utils/config.js';
import { getUsername } from '../utils/members.js';
import { linkProfessors, transformCoursePrerequisites } from './utils.js';
import { type Experience, type Link, type Question } from '@prisma/client';
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

export const getAboutEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
    .setTitle(botName)
    .setDescription(
      aboutMessage(commandMention('help'), commandMention('list questions')),
    )
    .setTimestamp();
};

export const getClassroomEmbed = async (information: Classroom) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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
};

export const getCourseParticipantsEmbed = async (
  information: CourseParticipants,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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
};

export const getCourseProfessorsEmbed = async (information: CourseStaff) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
    .setTitle(information.course)
    .addFields(
      {
        inline: true,
        name: labels.professors,
        value: linkProfessors(information.professors),
      },
      {
        inline: true,
        name: labels.assistants,
        value: linkProfessors(information.assistants),
      },
    )
    .setTimestamp();
};

export const getCoursePrerequisiteEmbed = async (
  information: CoursePrerequisites,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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
};

export const getCourseInfoEmbed = async (information: CourseInformation) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
    .setTitle(information.course)
    .addFields(
      {
        inline: true,
        name: labels.accreditation,
        value: `[${labels.link}](${information.link})`,
      },
      {
        inline: true,
        name: labels.code,
        value: information.code,
      },
      {
        inline: true,
        name: labels.level,
        value: information.level.toString(),
      },
    )
    .setTimestamp();
};

export const getCourseSummaryEmbed = async (course: string) => {
  const info = getInformation().find(
    (item) => item.course.toLowerCase() === course?.toLowerCase(),
  );
  const prerequisite = getPrerequisites().find(
    (item) => item.course.toLowerCase() === course?.toLowerCase(),
  );
  const professors = getProfessors().find(
    (item) => item.course.toLowerCase() === course?.toLowerCase(),
  );
  const participants = getParticipants().find(
    (item) => item.course.toLowerCase() === course?.toLowerCase(),
  );

  return [
    new EmbedBuilder()
      .setColor(await getConfigProperty('color'))
      .setTitle(course)
      .setDescription(embedMessages.courseSummaryInfo),
    new EmbedBuilder().setColor(await getConfigProperty('color')).addFields(
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
        name: labels.code,
        value: info === undefined ? labels.unknown : info.code,
      },
      {
        inline: true,
        name: labels.level,
        value: info === undefined ? labels.unknown : info.level.toString(),
      },
    ),
    new EmbedBuilder().setColor(await getConfigProperty('color')).addFields(
      {
        inline: true,
        name: labels.professors,
        value:
          professors === undefined
            ? labels.unknown
            : linkProfessors(professors.professors),
      },
      {
        inline: true,
        name: labels.assistants,
        value:
          professors === undefined
            ? labels.unknown
            : linkProfessors(professors.assistants),
      },
    ),
    new EmbedBuilder()
      .setColor(await getConfigProperty('color'))
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

export const getCoursesProgramEmbed = async (
  program: ProgramName,
  semester: number,
) => {
  const courses = transformCoursePrerequisites(
    programMapping[program],
    semester,
  );
  const elective = courses.filter((course) => course.type === 'изборен');
  const mandatory = courses.filter(
    (course) =>
      course.type === 'задолжителен' || course.type === 'задолжителен (изб.)',
  );

  return [
    new EmbedBuilder()
      .setColor(await getConfigProperty('color'))
      .setTitle(`Предмети за ${program}, семестар ${semester}`)
      .setDescription('Предусловите за предметите се под истиот реден број.'),
    new EmbedBuilder()
      .setColor(await getConfigProperty('color'))
      .setTitle('Задолжителни')
      .setDescription(
        mandatory.length === 0
          ? labels.none
          : mandatory
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                    course.course
                  } ${
                    course.type === 'задолжителен (изб.)'
                      ? '(изборен за 3 год. студии)'
                      : ''
                  }`,
              )
              .join('\n'),
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty('color'))
      .setTitle('Задолжителни - предуслови')
      .setDescription(
        mandatory.length === 0
          ? labels.none
          : mandatory
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                    course.prerequisite === ''
                      ? labels.none
                      : course.prerequisite
                  }`,
              )
              .join('\n'),
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty('color'))
      .setTitle('Изборни')
      .setDescription(
        elective.length === 0
          ? labels.none
          : elective
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                    course.course
                  }`,
              )
              .join('\n'),
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty('color'))
      .setTitle('Изборни - предуслови')
      .setDescription(
        elective.length === 0
          ? labels.none
          : elective
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                    course.prerequisite === ''
                      ? labels.none
                      : course.prerequisite
                  }`,
              )
              .join('\n'),
      )
      .setTimestamp(),
  ];
};

export const getCoursesPrerequisiteEmbed = async (course: string) => {
  const courses = getPrerequisites().filter((prerequisite) =>
    prerequisite.prerequisite.toLowerCase().includes(course.toLowerCase()),
  );

  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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

export const getStaffEmbed = async (information: Staff) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
    .setTitle(`${information.name}`)
    .addFields(
      {
        inline: true,
        name: labels.title,
        value: information.title,
      },
      {
        inline: true,
        name: labels.position,
        value: information.position,
      },
      {
        inline: true,
        name: labels.cabinet.toString(),
        value: information.cabinet.toString(),
      },
      {
        name: labels.email,
        value: information.email,
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
};

export const getStudentInfoEmbed = async (member: GuildMember) => {
  const yearRole = member.roles.cache.find((role) =>
    getFromRoleConfig('year').includes(role.name),
  );
  const programRole = member.roles.cache.find((role) =>
    getFromRoleConfig('program').includes(role.name),
  );
  const colorRole = member.roles.cache.find((role) =>
    getFromRoleConfig('color').includes(role.name),
  );
  const levelRole = member.roles.cache.find((role) =>
    getFromRoleConfig('level').includes(role.name),
  );
  const notificationRoles = member.roles.cache
    .filter((role) => getFromRoleConfig('notification').includes(role.name))
    .map((role) => roleMention(role.id))
    .join('\n');
  const courseRoles = member.roles.cache
    .filter((role) =>
      Object.keys(getFromRoleConfig('courses')).includes(role.name),
    )
    .map((role) => roleMention(role.id))
    .join('\n');
  const other = member.roles.cache
    .filter((role) => getFromRoleConfig('other').includes(role.name))
    .map((role) => roleMention(role.id))
    .join('\n');

  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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

export const getExperienceEmbed = async (experience: Experience) => {
  const guild = client.guilds.cache.get(await getConfigProperty('guild'));
  const user = guild?.members.cache.get(experience.userId)?.user as User;

  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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
};

export const getExperienceLeaderboardFirstPageEmbed = async (
  experience: Experience[],
  all: number,
  perPage: number = 8,
) => {
  const total = experience.length;

  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
    .setTitle(labels.activity)
    .addFields(
      await Promise.all(
        experience.slice(0, perPage).map(async (exp, index) => ({
          name: '\u200B',
          value: `${index + 1}. ${await getUsername(exp.userId)} (${userMention(
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
  perPage: number = 8,
) => {
  const total = experience.length;

  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
    .setTitle(labels.activity)
    .addFields(
      await Promise.all(
        experience
          .slice(perPage * page, perPage * (page + 1))
          .map(async (exp, index) => ({
            name: '\u200B',
            value: `${perPage * page + index + 1}. ${await getUsername(
              exp.userId,
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

export const getQuestionEmbed = async (question: Question) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
    .setTitle(question.name)
    .setDescription(question.content)
    .setTimestamp();
};

export const getQuestionComponents = (question: QuestionWithLinks) => {
  const components = [];

  if (question.links === undefined) {
    return [];
  }

  for (let index1 = 0; index1 < question.links.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      const { name, url } = question.links[index2] ?? {};
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

export const getLinkEmbed = async (link: Link) => {
  const embed = new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
    .setTitle(link.name)
    .setTimestamp();

  if (link.description !== undefined) {
    embed.setDescription(link.description);
  }

  return embed;
};

export const getLinkComponents = (link: Link) => {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setURL(link.url.startsWith('http') ? link.url : `https://${link.url}`)
        .setLabel(labels.link)
        .setStyle(ButtonStyle.Link),
    ),
  ];
};

export const getListQuestionsEmbed = async (questions: Question[]) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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
};

export const getListLinksEmbed = async (links: Link[]) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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
};

export const getHelpEmbed = async (
  commands: string[],
  page: number,
  commandsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty('color'))
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
};
