import { client } from './client.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getLinks,
  getQuestions,
  getStaff
} from './config.js';
import { commandMention } from './functions.js';
import { logger } from './logger.js';
import { getRole } from './roles.js';
import { commands } from './strings.js';
import {
  ActionRowBuilder,
  type AutocompleteInteraction,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  channelMention,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type GuildMember,
  inlineCode,
  type Interaction,
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
    .setDescription(`Овој бот е развиен од <@198249751001563136> за потребите на Discord серверот на студентите на ФИНКИ. Ботот е open source и може да се најде на [GitHub](https://github.com/Delemangi/finki-discord-bot). Ако имате било какви прашања, предлози или проблеми, контактирајте нè на Discord или на GitHub. \n\nНапишете ${commandMention('help')} за да ги видите сите достапни команди, или ${commandMention('list questions')} за да ги видите сите достапни прашања.`)
    .setTimestamp();
}

export function getClassroomEmbed (information: Classroom) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.classroom.toString())
    .addFields(
      {
        name: 'Тип',
        value: information.type
      },
      {
        name: 'Локација',
        value: information.location
      },
      {
        name: 'Спрат',
        value: information.floor.toString()
      },
      {
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
    .addFields(...Object.entries(information).filter(([year]) => year !== 'course').map(([year, participants]) => ({
      inline: true,
      name: year,
      value: participants.toString()
    })))
    .setTimestamp();
}

export function getCourseProfessorsEmbed (information: CourseStaff) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields({
      inline: true,
      name: 'Професори',
      value: linkProfessors(information.professors)
    },
    {
      inline: true,
      name: 'Асистенти',
      value: linkProfessors(information.assistants)
    })
    .setTimestamp();
}

export function getCoursePrerequisiteEmbed (information: CoursePrerequisites) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields({
      inline: true,
      name: 'Предуслови',
      value: information.prerequisite === '' ? 'Нема' : information.prerequisite ?? 'Нема'
    })
    .setTimestamp();
}

export function getCourseInfoEmbed (information: CourseInformation) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.course)
    .addFields({
      inline: true,
      name: 'Информации',
      value: `[Линк](${information.link})`
    })
    .setTimestamp();
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
    .setDescription(`Ова се сите достапни прашања. Користете ${commandMention('faq')} за да ги добиете одговорите.\n\n${getQuestions().map((question, index) => `${(index + 1).toString().padStart(2, '0')}. ${question.question}`).join('\n')}`)
    .setTimestamp();
}

export function getListLinksEmbed () {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Линкови')
    .setDescription(`Ова се сите достапни линкови. Користете ${commandMention('link')} за да ги добиете линковите.\n\n${getLinks().map((link, index) => `${(index + 1).toString().padStart(2, '0')}. [${link.name}](${link.link})`).join('\n')}`)
    .setTimestamp();
}

// Help

export function getHelpFirstPageEmbed (member: GuildMember | null, commandsPerPage: number = 8) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Команди')
    .setDescription('Ова се сите достапни команди за вас.')
    .addFields(...Object.entries(commands).filter((c) => checkCommandPermission(member, c[0])).slice(0, commandsPerPage).map(([command, description]) => ({
      name: commandMention(command),
      value: description
    })))
    .setFooter({ text: `1 / ${Math.ceil(getCommandsWithPermission(member).length / commandsPerPage)}` });
}

export function getHelpNextEmbed (member: GuildMember | null, page: number, commandsPerPage: number = 8) {
  return new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Команди')
    .setDescription('Ова се сите достапни команди за вас.')
    .addFields(...Object.entries(commands).filter((c) => checkCommandPermission(member, c[0])).slice(commandsPerPage * page, commandsPerPage * (page + 1)).map(([command, description]) => ({
      name: commandMention(command),
      value: description
    })))
    .setFooter({ text: `${page + 1} / ${Math.ceil(getCommandsWithPermission(member).length / commandsPerPage)}` });
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
    case 'pollstats':
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
    case 'pollstats':
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
    return '?';
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

  return permissions.any(member.permissions.bitfield);
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
