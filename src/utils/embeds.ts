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
  getStaff
} from './config.js';
import {
  getPollVotes,
  getPollVotesByOption
} from './database.js';
import { commandMention } from './functions.js';
import { logger } from './logger.js';
import { getRole } from './roles.js';
import {
  commands,
  programMapping
} from './strings.js';
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
  inlineCode,
  type Interaction,
  italic,
  roleMention,
  type UserContextMenuCommandInteraction,
  userMention
} from 'discord.js';

const color = getFromBotConfig('color');

// Commands

export function getAboutEmbed () {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('ФИНКИ Discord бот')
    .setThumbnail(getFromBotConfig('logo'))
    .setDescription(`Овој бот е развиен од ${userMention('198249751001563136')} за потребите на Discord серверот на студентите на ФИНКИ. Ботот е open source и може да се најде на [GitHub](https://github.com/Delemangi/finki-discord-bot). Ако имате било какви прашања, предлози или проблеми, контактирајте нè на Discord или на GitHub. \n\nНапишете ${commandMention('help')} за да ги видите сите достапни команди, или ${commandMention('list questions')} за да ги видите сите достапни прашања.`)
    .setTimestamp();
}

export function getClassroomEmbed (information: Classroom) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(`${information.classroom.toString()} (${information.location})`)
    .addFields(
      {
        inline: true,
        name: 'Тип',
        value: information.type
      },
      {
        inline: true,
        name: 'Локација',
        value: information.location
      },
      {
        inline: true,
        name: 'Спрат',
        value: information.floor.toString()
      },
      {
        inline: true,
        name: 'Капацитет',
        value: information.capacity.toString()
      }
    )
    .setTimestamp();
}

export function getCourseParticipantsEmbed (information: CourseParticipants) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields(
      {
        name: 'Број на запишани студенти',
        value: '\u200B'
      },
      ...Object.entries(information).filter(([year]) => year !== 'course').map(([year, participants]) => ({
        inline: true,
        name: year,
        value: participants.toString()
      }))
    )
    .setTimestamp();
}

export function getCourseProfessorsEmbed (information: CourseStaff) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields(
      {
        inline: true,
        name: 'Професори',
        value: linkProfessors(information.professors)
      },
      {
        inline: true,
        name: 'Асистенти',
        value: linkProfessors(information.assistants)
      }
    )
    .setTimestamp();
}

export function getCoursePrerequisiteEmbed (information: CoursePrerequisites) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields({
      inline: true,
      name: 'Предуслови',
      value: information.prerequisite === '' ? 'Нема' : information.prerequisite
    })
    .setTimestamp();
}

export function getCourseInfoEmbed (information: CourseInformation) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields(
      {
        inline: true,
        name: 'Информации',
        value: `[Линк](${information.link})`
      },
      {
        inline: true,
        name: 'Код',
        value: information.code
      },
      {
        inline: true,
        name: 'Ниво',
        value: information.level.toString()
      }
    )
    .setTimestamp();
}

export function getCourseSummaryEmbed (course: string | null) {
  if (course === null) {
    return [
      new EmbedBuilder()
        .setDescription('Нема информации за овој предмет.')
    ];
  }

  const info = getInformation().find((p) => p.course.toLowerCase() === course?.toLowerCase());
  const prerequisite = getPrerequisites().find((p) => p.course.toLowerCase() === course?.toLowerCase());
  const professors = getProfessors().find((p) => p.course.toLowerCase() === course?.toLowerCase());
  const participants = getParticipants().find((p) => p.course.toLowerCase() === course?.toLowerCase());

  return [
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(course)
      .setDescription('Ова се сите достапни информации за предметот.'),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .addFields(
        {
          name: 'Предуслови',
          value: prerequisite === undefined ? '-' : prerequisite.prerequisite === '' ? 'Нема' : prerequisite.prerequisite
        },
        {
          inline: true,
          name: 'Информации',
          value: info === undefined ? '-' : `[Линк](${info.link})`
        },
        {
          inline: true,
          name: 'Код',
          value: info === undefined ? '-' : info.code
        },
        {
          inline: true,
          name: 'Ниво',
          value: info === undefined ? '-' : info.level.toString()
        }
      ),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .addFields(
        {
          inline: true,
          name: 'Професори',
          value: professors === undefined ? '-' : linkProfessors(professors.professors)
        },
        {
          inline: true,
          name: 'Асистенти',
          value: professors === undefined ? '-' : linkProfessors(professors.assistants)
        }
      ),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .addFields(
        {
          name: 'Број на запишани студенти',
          value: '\u200B'
        },
        ...Object.entries(participants ?? {}).filter(([year]) => year !== 'course').map(([y, p]) => ({
          inline: true,
          name: y,
          value: p.toString()
        }))
      )
  ];
}

export function getCoursesProgramEmbed (program: ProgramKeys, semester: number) {
  const courses = transformCoursePrerequisites(programMapping[program], semester);
  const elective = courses.filter((c) => c.type === 'изборен');
  const mandatory = courses.filter((c) => c.type === 'задолжителен' || c.type === 'задолжителен (изб.)');

  return [
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(`Предмети за ${program}, семестар ${semester}`)
      .setDescription('Предусловите за предметите се под истиот реден број.'),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Задолжителни')
      .setDescription(mandatory.length === 0 ? 'Нема' : mandatory.map((c, i) => `${(i + 1).toString().padStart(2, '0')}. ${c.course} ${c.type === 'задолжителен (изб.)' ? '(изборен за 3 год. студии)' : ''}`).join('\n')),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Задолжителни - предуслови')
      .setDescription(mandatory.length === 0 ? 'Нема' : mandatory.map((c, i) => `${(i + 1).toString().padStart(2, '0')}. ${c.prerequisite === '' ? 'Нема' : c.prerequisite}`).join('\n')),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Изборни')
      .setDescription(elective.length === 0 ? 'Нема' : elective.map((c, i) => `${(i + 1).toString().padStart(2, '0')}. ${c.course}`).join('\n')),
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Изборни - предуслови')
      .setDescription(elective.length === 0 ? 'Нема' : elective.map((c, i) => `${(i + 1).toString().padStart(2, '0')}. ${c.prerequisite === '' ? 'Нема' : c.prerequisite}`).join('\n'))
      .setTimestamp()
  ];
}

export function getCoursesPrerequisiteEmbed (course: string) {
  const courses = getPrerequisites().filter((p) => p.prerequisite.toLowerCase().includes(course.toLowerCase()));

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(`Предмети со предуслов ${course}`)
    .setDescription(courses.length === 0 ? 'Нема' : courses.map((c, i) => `${(i + 1).toString().padStart(2, '0')}. ${c.course}`).join('\n'));
}

export function getStaffEmbed (information: Staff) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(`${information.name}`)
    .addFields(
      {
        inline: true,
        name: 'Звање',
        value: information.title
      },
      {
        inline: true,
        name: 'Позиција',
        value: information.position
      },
      {
        name: 'Електронска пошта',
        value: information.email
      },
      {
        inline: true,
        name: 'ФИНКИ',
        value: information.finki === '' ? '-' : `[Линк](${information.finki})`
      },
      {
        inline: true,
        name: 'Courses',
        value: information.courses === '' ? '-' : `[Линк](${information.courses})`
      },
      {
        inline: true,
        name: 'Распоред',
        value: information.raspored === '' ? '-' : `[Линк](${information.raspored})`
      },
      {
        inline: true,
        name: 'Консултации',
        value: information.konsultacii === '' ? '-' : `[Линк](${information.konsultacii})`
      }
    )
    .setTimestamp();
}

export function getStudentInfoEmbed (member: GuildMember | null | undefined) {
  if (member === null || member === undefined) {
    return new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Информации за студентот')
      .setDescription('Студентот не постои.');
  }

  const yearRole = member.roles.cache.find((r) => getFromRoleConfig('year').includes(r.name));
  const programRole = member.roles.cache.find((r) => getFromRoleConfig('program').includes(r.name));
  const colorRole = member.roles.cache.find((r) => getFromRoleConfig('color').includes(r.name));
  const levelRole = member.roles.cache.find((r) => getFromRoleConfig('level').includes(r.name));
  const notificationRoles = member.roles.cache.filter((r) => getFromRoleConfig('notification').includes(r.name)).map((r) => roleMention(r.id)).join('\n');
  const activityRoles = member.roles.cache.filter((r) => getFromRoleConfig('activity').includes(r.name)).map((r) => roleMention(r.id)).join('\n');
  const courseRoles = member.roles.cache.filter((r) => Object.keys(getFromRoleConfig('courses')).includes(r.name)).map((r) => `${roleMention(r.id)}: ${getFromRoleConfig('courses')[r.name]}`).join('\n');
  const other = member.roles.cache.filter((r) => getFromRoleConfig('other').includes(r.name)).map((r) => roleMention(r.id)).join('\n');

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setAuthor({
      iconURL: member.user.displayAvatarURL(),
      name: member.user.tag
    })
    .setTitle('Информации за студентот')
    .addFields(
      {
        inline: true,
        name: 'Година',
        value: yearRole === undefined ? 'Нема' : roleMention(yearRole.id)
      },
      {
        inline: true,
        name: 'Смер',
        value: programRole === undefined ? 'Нема' : roleMention(programRole.id)
      },
      {
        inline: true,
        name: 'Боја',
        value: colorRole === undefined ? 'Нема' : roleMention(colorRole.id)
      },
      {
        inline: true,
        name: 'Ниво',
        value: levelRole === undefined ? 'Нема' : roleMention(levelRole.id)
      },
      {
        inline: true,
        name: 'Нотификации',
        value: notificationRoles === '' ? 'Нема' : notificationRoles
      },
      {
        inline: true,
        name: 'Активности',
        value: activityRoles === '' ? 'Нема' : activityRoles
      },
      {
        name: 'Предмети',
        value: courseRoles === '' ? 'Нема' : courseRoles
      },
      {
        name: 'Друго',
        value: other === '' ? 'Нема' : other
      }
    )
    .setTimestamp();
}

// Questions & links

export function getQuestionEmbed (question: Question) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(question.question)
    .setDescription(question.answer)
    .setTimestamp();
}

export function getQuestionComponents (question: Question) {
  const components = [];

  if (question.links === undefined) {
    return [];
  }

  const entries = Object.entries(question.links);

  for (let i = 0; i < entries.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let j = i; j < i + 5; j++) {
      const [label, link] = entries[j] ?? ['', ''];
      if (label === undefined || link === undefined || label === '' || link === '') {
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
}

export function getLinkEmbed (link: Link) {
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(link.name)
    .setTimestamp();

  if (link.description !== undefined) {
    embed.setDescription(link.description);
  }

  return embed;
}

export function getLinkComponents (link: Link) {
  return [
    new ActionRowBuilder<ButtonBuilder>()
      .addComponents(new ButtonBuilder()
        .setURL(link.link)
        .setLabel('Линк')
        .setStyle(ButtonStyle.Link))
  ];
}

export function getListQuestionsEmbed () {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Прашања')
    .setDescription(`Ова се сите достапни прашања. Користете ${commandMention('faq')} за да ги добиете одговорите.\n\n${getQuestions().map((question, index) => `${inlineCode((index + 1).toString().padStart(2, '0'))} ${question.question}`).join('\n')}`)
    .setTimestamp();
}

export function getListLinksEmbed () {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Линкови')
    .setDescription(`Ова се сите достапни линкови. Користете ${commandMention('link')} за да ги добиете линковите.\n\n${getLinks().map((link, index) => `${inlineCode((index + 1).toString().padStart(2, '0'))} [${link.name}](${link.link})`).join('\n')}`)
    .setTimestamp();
}

// Help

export function getHelpFirstPageEmbed (member: GuildMember | null, commandsPerPage: number = 8) {
  const totalCommands = getCommandsWithPermission(member).length;

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Команди')
    .setDescription('Ова се сите достапни команди за вас. Командите може да ги повикате во овој сервер, или во приватна порака.')
    .addFields(...Object.entries(commands).filter((c) => checkCommandPermission(member, c[0])).slice(0, commandsPerPage).map(([command, description]) => ({
      name: commandMention(command),
      value: description
    })))
    .setFooter({ text: `Страна: 1 / ${Math.ceil(totalCommands / commandsPerPage)}  •  Команди: ${totalCommands}` })
    .setTimestamp();
}

export function getHelpNextEmbed (member: GuildMember | null, page: number, commandsPerPage: number = 8) {
  const totalCommands = getCommandsWithPermission(member).length;

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Команди')
    .setDescription('Ова се сите достапни команди за вас. Командите може да ги извршите во овој сервер, или во приватна порака.')
    .addFields(...Object.entries(commands).filter((c) => checkCommandPermission(member, c[0])).slice(commandsPerPage * page, commandsPerPage * (page + 1)).map(([command, description]) => ({
      name: commandMention(command),
      value: description
    })))
    .setFooter({ text: `Страна: ${page + 1} / ${Math.ceil(totalCommands / commandsPerPage)}  •  Команди: ${totalCommands}` })
    .setTimestamp();
}

// Polls

export async function getPollEmbed (poll: Poll) {
  const votes = (await getPollVotes(poll))?.length ?? 0;

  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(poll.title)
    .setDescription(`${italic(poll.description)}\n${codeBlock((await Promise.all(poll.options.map(async (option, index) => {
      const optionVotes = (await getPollVotesByOption(option))?.length ?? 0;
      const fraction = optionVotes / votes * 100;
      const bar = votes === 0 ? generatePollPercentageBar(0) : generatePollPercentageBar(fraction);

      return `${(index + 1).toString().padStart(2, '0')} ${option.name.padEnd(Math.max(...poll.options.map((o) => o.name.length)))} - [${bar}] - ${optionVotes} [${votes > 0 ? fraction.toFixed(2).padStart(5, '0') : '00'}%]`;
    }))).join('\n'))}\nИнформации и подесувања за анкетата:`)
    .addFields(
      {
        inline: true,
        name: 'Повеќекратна?',
        value: poll.multiple ? 'Да' : 'Не'
      },
      {
        inline: true,
        name: 'Анонимна?',
        value: poll.anonymous ? 'Да' : 'Не'
      },
      {
        inline: true,
        name: 'Отворена?',
        value: poll.open ? 'Да' : 'Не'
      },
      {
        inline: true,
        name: 'Автор',
        value: userMention(poll.owner)
      },
      {
        inline: true,
        name: 'Гласови',
        value: votes.toString()
      },
      {
        inline: true,
        name: '\u200B',
        value: '\u200B'
      }
    )
    .setFooter({ text: `Анкета: ${poll.id}` })
    .setTimestamp();
}

export function getPollComponents (poll: Poll) {
  const components = [];

  for (let i = 0; i < poll.options.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let j = i; j < i + 5; j++) {
      if (poll.options[j] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`poll:${poll.id}:${poll.options[j]?.name}`)
        .setLabel(`${poll.options[j]?.name}`)
        .setStyle(j % 4 === 0 ? ButtonStyle.Primary : j % 4 === 1 ? ButtonStyle.Secondary : j % 4 === 2 ? ButtonStyle.Success : ButtonStyle.Danger);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
}

export async function getPollStatsEmbed (poll: Poll) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(poll.title)
    .setDescription(`Гласови: ${(await getPollVotes(poll))?.length}`)
    .addFields(
      {
        inline: true,
        name: 'Опции',
        value: (await Promise.all(poll.options.map(async (option, index) => `${inlineCode((index + 1).toString().padStart(2, '0'))} ${option.name}`))).join('\n')
      },
      {
        inline: true,
        name: 'Гласови',
        value: (await Promise.all(poll.options.map(async (option, index) => `${inlineCode((index + 1).toString().padStart(2, '0'))} ${(await getPollVotesByOption(option))?.length ?? 0}`))).join('\n')
      }
    )
    .setFooter({ text: `Анкета: ${poll.id}` })
    .setTimestamp();
}

export function getPollStatsComponents (poll: Poll) {
  const components = [];

  for (let i = 0; i < poll.options.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let j = i; j < i + 5; j++) {
      if (poll.options[j] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`pollStats:${poll.id}:${poll.options[j]?.name}`)
        .setLabel(`${poll.options[j]?.name}`)
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
}

export async function getPollStatsButtonEmbed (id: string, option: string, votes: PollVote[]) {
  const users = await Promise.all(votes.map(async (vote) => (await client.users.fetch(vote.user)).tag));

  return votes.length > 0 ?
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Резултати од анкета')
      .setDescription(`Гласачи за ${inlineCode(option)}:\n${codeBlock(users.join('\n'))}`)
      .setTimestamp()
      .setFooter({ text: `Анкета: ${id}` }) :
    new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Резултати од анкета')
      .setDescription(`Никој не гласал за ${inlineCode(option)}`)
      .setTimestamp()
      .setFooter({ text: `Анкета: ${id}` });
}

// Logs

export async function getChatInputCommandEmbed (interaction: ChatInputCommandInteraction) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Chat Input Command')
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...await fetchMessageUrl(interaction)
    })
    .addFields(
      {
        inline: true,
        name: 'Author',
        value: userMention(interaction.user.id)
      },
      {
        inline: true,
        name: 'Channel',
        value: getChannel(interaction)
      },
      {
        inline: true,
        name: 'Command',
        value: inlineCode(interaction.toString())
      }

    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
}

export async function getUserContextMenuCommandEmbed (interaction: UserContextMenuCommandInteraction) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle('User Context Menu Command')
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...await fetchMessageUrl(interaction)
    })
    .addFields(
      {
        name: 'Author',
        value: userMention(interaction.user.id)
      },
      {
        name: 'Channel',
        value: getChannel(interaction)
      },
      {
        name: 'Command',
        value: inlineCode(interaction.commandName)
      },
      {
        name: 'Target',
        value: userMention(interaction.targetUser.id)
      }
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
}

export function getButtonEmbed (interaction: ButtonInteraction, command: string = 'unknown', args: string[] = []) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Button')
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag
    })
    .addFields(
      {
        inline: true,
        name: 'Author',
        value: userMention(interaction.user.id)
      },
      {
        inline: true,
        name: 'Channel',
        value: getChannel(interaction)
      },
      {
        inline: true,
        name: 'Command',
        value: getButtonCommand(command)
      },
      {
        inline: true,
        ...getButtonInfo(interaction, command, args)
      }
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
}

export function getAutocompleteEmbed (interaction: AutocompleteInteraction) {
  const focused = interaction.options.getFocused(true);

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Autocomplete')
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag
    })
    .addFields(
      {
        inline: true,
        name: 'Author',
        value: userMention(interaction.user.id)
      },
      {
        inline: true,
        name: 'Channel',
        value: getChannel(interaction)
      },
      {
        inline: true,
        name: 'Option',
        value: inlineCode(focused.name)
      },
      {
        inline: true,
        name: 'Value',
        value: focused.value === '' ? 'Empty' : inlineCode(focused.value)
      }
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
}

// Helpers

function getChannel (interaction: Interaction) {
  if (interaction.channel === null || interaction.channel.isDMBased()) {
    return 'DM';
  }

  return channelMention(interaction.channel.id);
}

function getButtonCommand (command?: string) {
  switch (command) {
    case undefined:
      return 'Unknown';
    case 'pollStats':
      return 'Poll Stats';
    case 'quizgame':
      return 'Quiz Game';
    default:
      return command.at(0)?.toUpperCase() + command.slice(1);
  }
}

function getButtonInfo (interaction: ButtonInteraction, command: string, args: string[]) {
  switch (command) {
    case 'course':
      return {
        name: getButtonCommand(command),
        value: roleMention(getRole(interaction.guild, 'courses', args[0])?.id ?? 'Unknown')
      };
    case 'year':
    case 'program':
    case 'notification':
    case 'activity':
    case 'color':
      return {
        name: getButtonCommand(command),
        value: roleMention(getRole(interaction.guild, command, args[0])?.id ?? 'Unknown')
      };
    case 'help':
    case 'poll':
    case 'pollStats':
    case 'quiz':
    case 'quizgame':
      return {
        name: getButtonCommand(command),
        value: args[0] === undefined ? 'Unknown' : inlineCode(args[0])
      };
    default:
      return {
        name: 'Unknown',
        value: 'Unknown'
      };
  }
}

function linkProfessors (professors: string) {
  if (professors === '') {
    return '-';
  }

  return professors
    .split('\n')
    .map((professor) => [professor, getStaff().find((p) => professor.includes(p.name))?.finki])
    .map(([professor, finki]) => finki ? `[${professor}](${finki})` : professor)
    .join('\n');
}

function checkCommandPermission (member: GuildMember | null, command: string) {
  if (member === null) {
    return true;
  }

  const permissions = client.application?.commands.cache.find((c) => c.name === (command.includes(' ') ? command.split(' ')[0] : command))?.defaultMemberPermissions;

  if (permissions === null || permissions === undefined) {
    return true;
  }

  return member.permissions.any(permissions.bitfield);
}

export function getCommandsWithPermission (member: GuildMember | null) {
  if (client.application === null) {
    return [];
  }

  return Object.keys(commands).filter((command) => checkCommandPermission(member, command));
}

async function fetchMessageUrl (interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction) {
  if (interaction.channel === null || !interaction.channel.isTextBased() || interaction.channel.isDMBased()) {
    return {};
  }

  try {
    return { url: (await interaction.fetchReply()).url };
  } catch {
    logger.warn(`Failed to fetch message URL for interaction by ${interaction.user.tag} in ${interaction.channel.name}`);
    return {};
  }
}

function transformCoursePrerequisites (program: ProgramValues, semester: number) {
  return getPrerequisites()
    .filter((p) => p.semester === semester)
    .filter((p) => p[program] === 'задолжителен' || p[program] === 'изборен' || p[program] === 'нема' || p[program] === 'задолжителен (изб.)')
    .map((p) => (p[program] === 'нема' ? {
      course: p.course,
      prerequisite: 'Нема',
      type: 'изборен'
    } : {
      course: p.course,
      prerequisite: p.prerequisite,
      type: p[program]
    }));
}

export function generatePollPercentageBar (percentage: number) {
  if (percentage === 0) {
    return '.'.repeat(20);
  }

  const pb = '█'.repeat(Math.floor(percentage / 5)) + (percentage - Math.floor(percentage) >= 0.5 ? '▌' : '');
  return pb + '.'.repeat(Math.max(0, 20 - pb.length));
}
