import { type Poll } from '../entities/Poll.js';
import { type PollVote } from '../entities/PollVote.js';
import { client } from './client.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getInformation,
  getLinks,
  getParticipants,
  getPrerequisites,
  getProfessors,
  getQuestions,
  getResponses,
  getRules,
  getStaff,
} from './config.js';
import { getPollVotes, getPollVotesByOption } from './database.js';
import { commandMention } from './functions.js';
import { logger } from './logger.js';
import { getMembersWithRoles, getRoleFromSet } from './roles.js';
import { commands, programMapping, quizHelp } from './strings.js';
import {
  ActionRowBuilder,
  type AutocompleteInteraction,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  channelMention,
  type ChatInputCommandInteraction,
  codeBlock,
  EmbedBuilder,
  type GuildMember,
  hyperlink,
  inlineCode,
  type Interaction,
  italic,
  roleMention,
  type UserContextMenuCommandInteraction,
  userMention,
} from 'discord.js';

const color = getFromBotConfig('color');

// Helpers

const truncateString = (string: string | null | undefined, length: number) => {
  if (string === null || string === undefined) {
    return '';
  }

  return string.length > length
    ? string.slice(0, Math.max(0, length - 3)) + '...'
    : string;
};

const getChannel = (interaction: Interaction) => {
  if (interaction.channel === null || interaction.channel.isDMBased()) {
    return 'DM';
  }

  return channelMention(interaction.channel.id);
};

const getButtonCommand = (command?: string) => {
  switch (command) {
    case undefined:
      return 'Unknown';
    case 'pollStats':
      return 'Poll Stats';
    case 'quizGame':
      return 'Quiz Game';
    default:
      return command[0]?.toUpperCase() + command.slice(1);
  }
};

const getButtonInfo = (
  interaction: ButtonInteraction,
  command: string,
  args: string[],
) => {
  switch (command) {
    case 'course':
      return {
        name: getButtonCommand(command),
        value: roleMention(
          getRoleFromSet(interaction.guild, 'courses', args[0])?.id ??
            'Unknown',
        ),
      };
    case 'year':
    case 'program':
    case 'notification':
    case 'color':
      return {
        name: getButtonCommand(command),
        value: roleMention(
          getRoleFromSet(interaction.guild, command, args[0])?.id ?? 'Unknown',
        ),
      };
    case 'help':
    case 'poll':
    case 'pollStats':
    case 'quiz':
    case 'quizGame':
    case 'removeCourses':
    case 'vip':
      return {
        name: getButtonCommand(command),
        value: args[0] === undefined ? 'Unknown' : inlineCode(args[0]),
      };
    default:
      return {
        name: 'Unknown',
        value: 'Unknown',
      };
  }
};

const linkProfessors = (professors: string) => {
  if (professors === '') {
    return '-';
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

const checkCommandPermission = (
  member: GuildMember | null,
  command: string,
) => {
  if (member === null) {
    return true;
  }

  const permissions = client.application?.commands.cache.find(
    (com) =>
      com.name === (command.includes(' ') ? command.split(' ')[0] : command),
  )?.defaultMemberPermissions;

  if (permissions === null || permissions === undefined) {
    return true;
  }

  return member.permissions.any(permissions.bitfield);
};

export const getCommandsWithPermission = (member: GuildMember | null) => {
  if (client.application === null) {
    return [];
  }

  return Object.keys(commands).filter((command) =>
    checkCommandPermission(member, command),
  );
};

const fetchMessageUrl = async (
  interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction,
) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    return {};
  }

  try {
    return { url: (await interaction.fetchReply()).url };
  } catch {
    logger.warn(
      `Failed to fetch message URL for interaction by ${interaction.user.tag} in ${interaction.channel.name}`,
    );
    return {};
  }
};

const transformCoursePrerequisites = (
  program: ProgramValues,
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
            prerequisite: 'Нема',
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

  const pb =
    '█'.repeat(Math.floor(percentage / 5)) +
    (percentage - Math.floor(percentage) >= 0.5 ? '▌' : '');
  return pb + '.'.repeat(Math.max(0, 20 - pb.length));
};

// Scripts

export const getColorsEmbed = (image: string) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Боја на име')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription('Изберете боја за вашето име.')
    .setFooter({
      text: '(може да изберете само една опција, секоја нова опција ја заменува старата)',
    })
    .setImage(image);
};

export const getColorsComponents = () => {
  const components = [];
  const roles = getFromRoleConfig('color');

  for (let index1 = 0; index1 < roles.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roles[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`color:${roles[index2] ?? ''}`)
        .setLabel(`${index2 + 1}`)
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getCoursesEmbed = (roleSet: string, roles: string[]) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(`${roleSet.length > 1 ? '' : 'Семестар'} ${roleSet}`)
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      roles
        .map(
          (role, index_) =>
            `${inlineCode((index_ + 1).toString().padStart(2, '0'))} ${
              getFromRoleConfig('courses')[role]
            }`,
        )
        .join('\n'),
    )
    .setFooter({ text: '(може да изберете повеќе опции)' });
};

export const getCoursesComponents = (roles: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roles.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roles[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`course:${roles[index2]}`)
        .setLabel(`${index2 + 1}`)
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getCoursesAddEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Масовно земање предмети')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      'Земете предмети од одредени семестри чии канали сакате да ги гледате.',
    )
    .setFooter({ text: '(може да изберете повеќе опции)' });
};

export const getCoursesAddComponents = (roleSets: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roleSets.length + 5; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    if (index1 >= roleSets.length) {
      const addAllButton = new ButtonBuilder()
        .setCustomId(`addCourses:all`)
        .setLabel('Сите')
        .setStyle(ButtonStyle.Success);

      const addAllRow = new ActionRowBuilder<ButtonBuilder>();

      addAllRow.addComponents(addAllButton);
      components.push(addAllRow);
      break;
    }

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roleSets[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`addCourses:${roleSets[index2]}`)
        .setLabel(`Семестар ${roleSets[index2]}`)
        .setStyle(ButtonStyle.Success);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getCoursesRemoveEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Масовно отстранување предмети')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      'Отстранете предмети од одредени семестри чии канали не сакате да ги гледате.',
    )
    .setFooter({ text: '(може да изберете повеќе опции)' });
};

export const getCoursesRemoveComponents = (roleSets: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roleSets.length + 5; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    if (index1 >= roleSets.length) {
      const removeAllButton = new ButtonBuilder()
        .setCustomId(`removeCourses:all`)
        .setLabel('Сите')
        .setStyle(ButtonStyle.Danger);

      const removeAllRow = new ActionRowBuilder<ButtonBuilder>();

      removeAllRow.addComponents(removeAllButton);
      components.push(removeAllRow);
      break;
    }

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roleSets[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`removeCourses:${roleSets[index2]}`)
        .setLabel(`Семестар ${roleSets[index2]}`)
        .setStyle(ButtonStyle.Danger);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getNotificationsEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Нотификации')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      'Изберете за кои типови на објави сакате да добиете нотификации.',
    )
    .setFooter({ text: '(може да изберете повеќе опции)' });
};

export const getNotificationsComponents = (roles: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roles.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roles[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`notification:${roles[index2] ?? ''}`)
        .setLabel(roles[index2] ?? '')
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getProgramsEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Смер')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription('Изберете го смерот на кој студирате.')
    .setFooter({
      text: '(може да изберете само една опција, секоја нова опција ја заменува старата)',
    });
};

export const getProgramsComponents = (roles: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roles.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roles[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`program:${roles[index2] ?? ''}`)
        .setLabel(roles[index2] ?? '')
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getYearsEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Година на студирање')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription('Изберете ја годината на студирање.')
    .setFooter({
      text: '(може да изберете само една опција, секоја нова опција ја заменува старата)',
    });
};

export const getYearsComponents = (roles: string[]) => {
  const components = new ActionRowBuilder<ButtonBuilder>();
  const buttons = [];

  for (const role of roles) {
    const button = new ButtonBuilder()
      .setCustomId(`year:${role}`)
      .setLabel(role)
      .setStyle(ButtonStyle.Secondary);

    buttons.push(button);
  }

  components.addComponents(buttons);

  return components;
};

export const getRulesEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Правила')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      `${getRules()
        .map(
          (value, index) =>
            `${inlineCode((index + 1).toString().padStart(2, '0'))} ${value}`,
        )
        .join('\n\n')} \n\n ${italic(
        'Евентуално кршење на правилата може да доведе до санкции',
      )}.`,
    );
};

export const getVipScriptEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Изјава за големи нешта')
    .setDescription(
      getResponses().find((response) => response.command === 'vip')?.response ??
        '-',
    );
};

export const getVipScriptComponents = () => {
  const components = [];

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('vip:accept')
      .setLabel('Прифаќам')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('vip:decline')
      .setLabel('Одбивам')
      .setStyle(ButtonStyle.Danger),
  );
  components.push(row);

  return components;
};

// Commands

export const getAboutEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('ФИНКИ Discord бот')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(
      `Овој бот е развиен од ${userMention(
        '198249751001563136',
      )} за потребите на Discord серверот на студентите на ФИНКИ. Ботот е open source и може да се најде на ${hyperlink(
        'GitHub',
        'https://github.com/Delemangi/finki-discord-bot',
      )}. Ако имате било какви прашања, предлози или проблеми, контактирајте нè на Discord или на GitHub. \n\nНапишете ${commandMention(
        'help',
      )} за да ги видите сите достапни команди, или ${commandMention(
        'list questions',
      )} за да ги видите сите достапни прашања.`,
    )
    .setTimestamp();
};

export const getClassroomEmbed = (information: Classroom) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(`${information.classroom.toString()} (${information.location})`)
    .addFields(
      {
        inline: true,
        name: 'Тип',
        value: information.type,
      },
      {
        inline: true,
        name: 'Локација',
        value: information.location,
      },
      {
        inline: true,
        name: 'Спрат',
        value: information.floor.toString(),
      },
      {
        inline: true,
        name: 'Капацитет',
        value: information.capacity.toString(),
      },
    )
    .setTimestamp();
};

export const getCourseParticipantsEmbed = (information: CourseParticipants) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields(
      {
        name: 'Број на запишани студенти',
        value: '\u200B',
      },
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

export const getCourseProfessorsEmbed = (information: CourseStaff) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields(
      {
        inline: true,
        name: 'Професори',
        value: linkProfessors(information.professors),
      },
      {
        inline: true,
        name: 'Асистенти',
        value: linkProfessors(information.assistants),
      },
    )
    .setTimestamp();
};

export const getCoursePrerequisiteEmbed = (
  information: CoursePrerequisites,
) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields({
      inline: true,
      name: 'Предуслови',
      value:
        information.prerequisite === '' ? 'Нема' : information.prerequisite,
    })
    .setTimestamp();
};

export const getCourseInfoEmbed = (information: CourseInformation) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields(
      {
        inline: true,
        name: 'Информации',
        value: `[Линк](${information.link})`,
      },
      {
        inline: true,
        name: 'Код',
        value: information.code,
      },
      {
        inline: true,
        name: 'Ниво',
        value: information.level.toString(),
      },
    )
    .setTimestamp();
};

export const getCourseSummaryEmbed = (course: string | null) => {
  if (course === null) {
    return [
      new EmbedBuilder().setDescription('Нема информации за овој предмет.'),
    ];
  }

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
      .setColor(getFromBotConfig('color'))
      .setTitle(course)
      .setDescription('Ова се сите достапни информации за предметот.'),
    new EmbedBuilder().setColor(getFromBotConfig('color')).addFields(
      {
        name: 'Предуслови',
        value:
          prerequisite === undefined
            ? '-'
            : prerequisite.prerequisite === ''
            ? 'Нема'
            : prerequisite.prerequisite,
      },
      {
        inline: true,
        name: 'Информации',
        value: info === undefined ? '-' : `[Линк](${info.link})`,
      },
      {
        inline: true,
        name: 'Код',
        value: info === undefined ? '-' : info.code,
      },
      {
        inline: true,
        name: 'Ниво',
        value: info === undefined ? '-' : info.level.toString(),
      },
    ),
    new EmbedBuilder().setColor(getFromBotConfig('color')).addFields(
      {
        inline: true,
        name: 'Професори',
        value:
          professors === undefined
            ? '-'
            : linkProfessors(professors.professors),
      },
      {
        inline: true,
        name: 'Асистенти',
        value:
          professors === undefined
            ? '-'
            : linkProfessors(professors.assistants),
      },
    ),
    new EmbedBuilder().setColor(getFromBotConfig('color')).addFields(
      {
        name: 'Број на запишани студенти',
        value: '\u200B',
      },
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

export const getCoursesProgramEmbed = (
  program: ProgramKeys,
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
      .setColor(getFromBotConfig('color'))
      .setTitle(`Предмети за ${program}, семестар ${semester}`)
      .setDescription('Предусловите за предметите се под истиот реден број.'),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Задолжителни')
      .setDescription(
        mandatory.length === 0
          ? 'Нема'
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
      .setColor(getFromBotConfig('color'))
      .setTitle('Задолжителни - предуслови')
      .setDescription(
        mandatory.length === 0
          ? 'Нема'
          : mandatory
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                    course.prerequisite === '' ? 'Нема' : course.prerequisite
                  }`,
              )
              .join('\n'),
      ),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Изборни')
      .setDescription(
        elective.length === 0
          ? 'Нема'
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
      .setColor(getFromBotConfig('color'))
      .setTitle('Изборни - предуслови')
      .setDescription(
        elective.length === 0
          ? 'Нема'
          : elective
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                    course.prerequisite === '' ? 'Нема' : course.prerequisite
                  }`,
              )
              .join('\n'),
      )
      .setTimestamp(),
  ];
};

export const getCoursesPrerequisiteEmbed = (course: string) => {
  const courses = getPrerequisites().filter((prerequisite) =>
    prerequisite.prerequisite.toLowerCase().includes(course.toLowerCase()),
  );

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(`Предмети со предуслов ${course}`)
    .setDescription(
      courses.length === 0
        ? 'Нема'
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

export const getStaffEmbed = (information: Staff) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(`${information.name}`)
    .addFields(
      {
        inline: true,
        name: 'Звање',
        value: information.title,
      },
      {
        inline: true,
        name: 'Позиција',
        value: information.position,
      },
      {
        name: 'Електронска пошта',
        value: information.email,
      },
      {
        inline: true,
        name: 'ФИНКИ',
        value: information.finki === '' ? '-' : `[Линк](${information.finki})`,
      },
      {
        inline: true,
        name: 'Courses',
        value:
          information.courses === '' ? '-' : `[Линк](${information.courses})`,
      },
      {
        inline: true,
        name: 'Распоред',
        value:
          information.raspored === '' ? '-' : `[Линк](${information.raspored})`,
      },
      {
        inline: true,
        name: 'Консултации',
        value:
          information.konsultacii === ''
            ? '-'
            : `[Линк](${information.konsultacii})`,
      },
    )
    .setTimestamp();
};

export const getStudentInfoEmbed = (member: GuildMember | null | undefined) => {
  if (member === null || member === undefined) {
    return new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Информации за студентот')
      .setDescription('Студентот не постои.');
  }

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
    .map(
      (role) =>
        `${roleMention(role.id)}: ${getFromRoleConfig('courses')[role.name]}`,
    )
    .join('\n');
  const other = member.roles.cache
    .filter((role) => getFromRoleConfig('other').includes(role.name))
    .map((role) => roleMention(role.id))
    .join('\n');

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setAuthor({
      iconURL: member.user.displayAvatarURL(),
      name: member.user.tag,
    })
    .setTitle('Информации за студентот')
    .addFields(
      {
        inline: true,
        name: 'Година',
        value: yearRole === undefined ? 'Нема' : roleMention(yearRole.id),
      },
      {
        inline: true,
        name: 'Смер',
        value: programRole === undefined ? 'Нема' : roleMention(programRole.id),
      },
      {
        inline: true,
        name: 'Боја',
        value: colorRole === undefined ? 'Нема' : roleMention(colorRole.id),
      },
      {
        inline: true,
        name: 'Ниво',
        value: levelRole === undefined ? 'Нема' : roleMention(levelRole.id),
      },
      {
        inline: true,
        name: 'Нотификации',
        value: notificationRoles === '' ? 'Нема' : notificationRoles,
      },
      {
        name: 'Предмети',
        value: courseRoles === '' ? 'Нема' : courseRoles,
      },
      {
        name: 'Друго',
        value: other === '' ? 'Нема' : other,
      },
    )
    .setTimestamp();
};

export const getVipEmbed = async (interaction: ChatInputCommandInteraction) => {
  await interaction.guild?.members.fetch();

  const vipRole = interaction.guild?.roles.cache.find(
    (role) => role.name === 'ВИП' || role.name === 'VIP',
  );
  const vipMembers = [];

  for (const member of vipRole?.members.values() ?? []) {
    const user = await interaction.guild?.members.fetch(member.user.id);
    vipMembers.push(user);
  }

  const adminRole = interaction.guild?.roles.cache.find(
    (role) => role.name === 'Админ тим' || role.name === 'Admin team',
  );
  const adminMembers = [];

  for (const member of adminRole?.members.values() ?? []) {
    const user = await interaction.guild?.members.fetch(member.user.id);
    adminMembers.push(user);
  }

  const fssRole = interaction.guild?.roles.cache.find(
    (role) => role.name.includes('ФСС') || role.name.includes('FSS'),
  );
  const fssMembers = [];

  for (const member of fssRole?.members.values() ?? []) {
    const user = await interaction.guild?.members.fetch(member.user.id);
    fssMembers.push(user);
  }

  return [
    new EmbedBuilder().setColor(getFromBotConfig('color')).setTitle('Состав'),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(`ВИП: ${vipMembers.length}`)
      .setDescription(
        vipMembers.length === 0
          ? 'Нема членови на ВИП.'
          : vipMembers
              .map((member) => userMention(member?.user.id as string))
              .join('\n'),
      ),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(`Админ тим: ${adminMembers.length}`)
      .setDescription(
        adminMembers.length === 0
          ? 'Нема администратори.'
          : adminMembers
              .map((member) => userMention(member?.user.id as string))
              .join('\n'),
      ),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(`ФСС: ${fssMembers.length}`)
      .setDescription(
        fssMembers.length === 0
          ? 'Нема членови на ФСС.'
          : fssMembers
              .map((member) => userMention(member?.user.id as string))
              .join('\n'),
      )
      .setTimestamp(),
  ];
};

// Questions & links

export const getQuestionEmbed = (question: Question) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(question.question)
    .setDescription(question.answer)
    .setTimestamp();
};

export const getQuestionComponents = (question: Question) => {
  const components = [];

  if (question.links === undefined) {
    return [];
  }

  const entries = Object.entries(question.links);

  for (let index1 = 0; index1 < entries.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      const [label, link] = entries[index2] ?? ['', ''];
      if (
        label === undefined ||
        link === undefined ||
        label === '' ||
        link === ''
      ) {
        break;
      }

      const button = new ButtonBuilder()
        .setURL(link)
        .setLabel(label)
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
    .setColor(getFromBotConfig('color'))
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
        .setURL(link.link)
        .setLabel('Линк')
        .setStyle(ButtonStyle.Link),
    ),
  ];
};

export const getListQuestionsEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Прашања')
    .setDescription(
      `Ова се сите достапни прашања. Користете ${commandMention(
        'faq',
      )} за да ги добиете одговорите.\n\n${getQuestions()
        .map(
          (question, index) =>
            `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
              question.question
            }`,
        )
        .join('\n')}`,
    )
    .setTimestamp();
};

export const getListLinksEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Линкови')
    .setDescription(
      `Ова се сите достапни линкови. Користете ${commandMention(
        'link',
      )} за да ги добиете линковите.\n\n${getLinks()
        .map(
          (link, index) =>
            `${inlineCode((index + 1).toString().padStart(2, '0'))} [${
              link.name
            }](${link.link})`,
        )
        .join('\n')}`,
    )
    .setTimestamp();
};

// Help

export const getHelpFirstPageEmbed = (
  member: GuildMember | null,
  commandsPerPage: number = 8,
) => {
  const totalCommands = getCommandsWithPermission(member).length;

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Команди')
    .setDescription(
      'Ова се сите достапни команди за вас. Командите може да ги повикате во овој сервер, или во приватна порака.',
    )
    .addFields(
      ...Object.entries(commands)
        .filter((command) => checkCommandPermission(member, command[0]))
        .slice(0, commandsPerPage)
        .map(([command, description]) => ({
          name: commandMention(command),
          value: description,
        })),
    )
    .setFooter({
      text: `Страна: 1 / ${Math.ceil(
        totalCommands / commandsPerPage,
      )}  •  Команди: ${totalCommands}`,
    })
    .setTimestamp();
};

export const getHelpNextEmbed = (
  member: GuildMember | null,
  page: number,
  commandsPerPage: number = 8,
) => {
  const totalCommands = getCommandsWithPermission(member).length;

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Команди')
    .setDescription(
      'Ова се сите достапни команди за вас. Командите може да ги извршите во овој сервер, или во приватна порака.',
    )
    .addFields(
      ...Object.entries(commands)
        .filter((command) => checkCommandPermission(member, command[0]))
        .slice(commandsPerPage * page, commandsPerPage * (page + 1))
        .map(([command, description]) => ({
          name: commandMention(command),
          value: description,
        })),
    )
    .setFooter({
      text: `Страна: ${page + 1} / ${Math.ceil(
        totalCommands / commandsPerPage,
      )}  •  Команди: ${totalCommands}`,
    })
    .setTimestamp();
};

// Polls

export const getPollEmbed = async (interaction: Interaction, poll: Poll) => {
  const votes = (await getPollVotes(poll))?.length ?? 0;
  const voters = await getMembersWithRoles(interaction.guild, ...poll.roles);
  const turnout = `(${((votes / voters.length) * 100).toFixed(2)}%)`;

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(truncateString(poll.title, 256))
    .setDescription(
      `${italic(truncateString(poll.description, 1_000))}\n${codeBlock(
        (
          await Promise.all(
            poll.options.map(async (option, index) => {
              const optionVotes =
                (await getPollVotesByOption(option))?.length ?? 0;
              const fraction = (optionVotes / votes) * 100;
              const bar =
                votes === 0
                  ? generatePollPercentageBar(0)
                  : generatePollPercentageBar(fraction);

              return `${(index + 1)
                .toString()
                .padStart(2, '0')} ${option.name.padEnd(
                Math.max(...poll.options.map((opt) => opt.name.length)),
              )} - [${bar}] - ${optionVotes} [${
                votes > 0 ? fraction.toFixed(2).padStart(5, '0') : '00'
              }%]`;
            }),
          )
        ).join('\n'),
      )}\nИнформации и подесувања за анкетата:`,
    )
    .addFields(
      {
        inline: true,
        name: 'Повеќекратна?',
        value: poll.multiple ? 'Да' : 'Не',
      },
      {
        inline: true,
        name: 'Анонимна?',
        value: poll.anonymous ? 'Да' : 'Не',
      },
      {
        inline: true,
        name: 'Отворена?',
        value: poll.open ? 'Да' : 'Не',
      },
      {
        inline: true,
        name: 'Автор',
        value: userMention(poll.owner),
      },
      {
        inline: true,
        name: 'Гласови',
        value: `${votes} ${poll.roles.length > 0 ? turnout : ''}`,
      },
      {
        inline: true,
        name: 'Право на глас',
        value:
          poll.roles.length === 0
            ? 'Сите'
            : (
                await getMembersWithRoles(interaction.guild, ...poll.roles)
              ).length.toString(),
      },
      {
        inline: true,
        name: 'Улоги',
        value:
          poll.roles.length > 0
            ? poll.roles.map((role) => roleMention(role)).join(', ')
            : 'Нема',
      },
    )
    .setFooter({ text: `Анкета: ${poll.id}` })
    .setTimestamp();
};

export const getPollComponents = (poll: Poll) => {
  const components = [];

  for (let index1 = 0; index1 < poll.options.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (poll.options[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`poll:${poll.id}:${poll.options[index2]?.id}`)
        .setLabel(`${truncateString(poll.options[index2]?.name, 80)}`)
        .setStyle(
          [
            ButtonStyle.Primary,
            ButtonStyle.Secondary,
            ButtonStyle.Success,
            ButtonStyle.Danger,
          ][index2 % 4] as ButtonStyle,
        );

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getPollStatsEmbed = async (poll: Poll) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(poll.title)
    .setDescription(`Гласови: ${(await getPollVotes(poll))?.length}`)
    .addFields(
      {
        inline: true,
        name: 'Опции',
        value: (
          await Promise.all(
            poll.options.map(
              async (option, index) =>
                `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                  option.name
                }`,
            ),
          )
        ).join('\n'),
      },
      {
        inline: true,
        name: 'Гласови',
        value: (
          await Promise.all(
            poll.options.map(
              async (option, index) =>
                `${inlineCode((index + 1).toString().padStart(2, '0'))} ${
                  (await getPollVotesByOption(option))?.length ?? 0
                }`,
            ),
          )
        ).join('\n'),
      },
    )
    .setFooter({ text: `Анкета: ${poll.id}` })
    .setTimestamp();
};

export const getPollStatsComponents = (poll: Poll) => {
  const components = [];

  for (let index1 = 0; index1 < poll.options.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (poll.options[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`pollStats:${poll.id}:${poll.options[index2]?.id}`)
        .setLabel(`${truncateString(poll.options[index2]?.name, 80)}`)
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getPollStatsButtonEmbed = async (
  id: string,
  option: string,
  votes: PollVote[],
) => {
  const users = await Promise.all(
    votes.map(async (vote) => (await client.users.fetch(vote.user)).tag),
  );

  return votes.length > 0
    ? new EmbedBuilder()
        .setColor(getFromBotConfig('color'))
        .setTitle('Резултати од анкета')
        .setDescription(
          `Гласачи за ${inlineCode(option)}:\n${codeBlock(users.join('\n'))}`,
        )
        .setTimestamp()
        .setFooter({ text: `Анкета: ${id}` })
    : new EmbedBuilder()
        .setColor(getFromBotConfig('color'))
        .setTitle('Резултати од анкета')
        .setDescription(`Никој не гласал за ${inlineCode(option)}`)
        .setTimestamp()
        .setFooter({ text: `Анкета: ${id}` });
};

// Quiz

export const getQuizEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Кој Сака Да Биде Морален Победник?')
    .setDescription('Добредојдовте на квизот.\nДали сакате да започнете?')
    .setTimestamp()
    .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2023' });
};

export const getQuizComponents = (interaction: ChatInputCommandInteraction) => {
  const components = [];
  const row = new ActionRowBuilder<ButtonBuilder>();
  const buttons = [];

  buttons.push(
    new ButtonBuilder()
      .setCustomId(`quiz:${interaction.user.id}:y`)
      .setLabel('Да')
      .setStyle(ButtonStyle.Primary),
  );

  buttons.push(
    new ButtonBuilder()
      .setCustomId(`quiz:${interaction.user.id}:n`)
      .setLabel('Не')
      .setStyle(ButtonStyle.Danger),
  );

  buttons.push(
    new ButtonBuilder()
      .setCustomId(`quiz:${interaction.user.id}:h`)
      .setLabel('Помош за квизот')
      .setStyle(ButtonStyle.Secondary),
  );

  row.addComponents(buttons);
  components.push(row);

  return components;
};

export const getQuizQuestionEmbed = (question: QuizQuestion, level: number) => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Кој Сака Да Биде Морален Победник?')
    .setDescription(
      codeBlock(
        `Прашање бр. ${level + 1}\n\nQ: ${question.question}\n${question.answers
          .map(
            (quest, index) =>
              `${(index + 1).toString().padStart(2, '0')} ${quest}`,
          )
          .join('\n')}`,
      ),
    )
    .setTimestamp()
    .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2023' });
};

export const getQuizQuestionComponents = (
  question: QuizQuestion,
  level: number,
  userId: string,
) => {
  const components = [];
  const row = new ActionRowBuilder<ButtonBuilder>();
  const buttons = [];

  for (let index = 0; index < 4; index++) {
    const button = new ButtonBuilder()
      .setCustomId(
        `quizGame:${userId}:s:${question.answers[index]}:${question.correctAnswer}:${level}`,
      )
      .setLabel(`${index + 1}`)
      .setStyle(ButtonStyle.Primary);
    buttons.push(button);
  }

  row.addComponents(buttons);
  components.push(row);

  return components;
};

export const getQuizBeginEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Кој Сака Да Биде Морален Победник?')
    .setDescription(italic('Започни?'))
    .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2023' })
    .setTimestamp();
};

export const getQuizBeginComponents = (interaction: ButtonInteraction) => {
  const components: Array<ActionRowBuilder<ButtonBuilder>> = [];
  const row = new ActionRowBuilder<ButtonBuilder>();
  const buttons = [];

  buttons.push(
    new ButtonBuilder()
      .setCustomId(`quizGame:${interaction.user.id}:y:option:answer:0`)
      .setLabel('Да')
      .setStyle(ButtonStyle.Primary),
  );

  buttons.push(
    new ButtonBuilder()
      .setCustomId(`quizGame:${interaction.user.id}:n`)
      .setLabel('Не')
      .setStyle(ButtonStyle.Danger),
  );

  row.addComponents(buttons);
  components.push(row);

  return components;
};

export const getQuizHelpEmbed = () => {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Кој Сака Да Биде Морален Победник?')
    .setDescription(quizHelp)
    .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2023' })
    .setTimestamp();
};

// Logs

export const getChatInputCommandEmbed = async (
  interaction: ChatInputCommandInteraction,
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Chat Input Command')
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        inline: true,
        name: 'Author',
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: 'Channel',
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: 'Command',
        value: inlineCode(
          interaction.toString().length > 300
            ? interaction.toString().slice(0, 300)
            : interaction.toString(),
        ),
      },
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
};

export const getUserContextMenuCommandEmbed = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle('User Context Menu Command')
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        name: 'Author',
        value: userMention(interaction.user.id),
      },
      {
        name: 'Channel',
        value: getChannel(interaction),
      },
      {
        name: 'Command',
        value: inlineCode(interaction.commandName),
      },
      {
        name: 'Target',
        value: userMention(interaction.targetUser.id),
      },
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
};

export const getButtonEmbed = (
  interaction: ButtonInteraction,
  command: string = 'unknown',
  args: string[] = [],
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Button')
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: 'Author',
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: 'Channel',
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: 'Command',
        value: getButtonCommand(command),
      },
      {
        inline: true,
        ...getButtonInfo(interaction, command, args),
      },
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
};

export const getAutocompleteEmbed = (interaction: AutocompleteInteraction) => {
  const focused = interaction.options.getFocused(true);

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Autocomplete')
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: 'Author',
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: 'Channel',
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: 'Option',
        value: inlineCode(focused.name),
      },
      {
        inline: true,
        name: 'Value',
        value: focused.value === '' ? 'Empty' : inlineCode(focused.value),
      },
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
};
