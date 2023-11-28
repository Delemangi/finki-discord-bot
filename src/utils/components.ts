import { getMostPopularOptionByPollId } from "../data/PollOption.js";
import {
  getPollVotesByOptionId,
  getPollVotesByPollId,
} from "../data/PollVote.js";
import { type Classroom } from "../types/Classroom.js";
import { type CourseInformation } from "../types/CourseInformation.js";
import { type CourseParticipants } from "../types/CourseParticipants.js";
import { type CoursePrerequisites } from "../types/CoursePrerequisites.js";
import { type CourseStaff } from "../types/CourseStaff.js";
import { type PaginationPosition } from "../types/PaginationPosition.js";
import { type PollWithOptions } from "../types/PollWithOptions.js";
import { type ProgramName } from "../types/ProgramName.js";
import { type ProgramShorthand } from "../types/ProgramShorthand.js";
import { type QuestionWithLinks } from "../types/QuestionWithLinks.js";
import { type Staff } from "../types/Staff.js";
import { client } from "./client.js";
import { commandMention } from "./commands.js";
import {
  getConfigProperty,
  getFromRoleConfig,
  getInformation,
  getParticipants,
  getPrerequisites,
  getProfessors,
  getRoleProperty,
  getStaff,
} from "./config.js";
import { logger } from "./logger.js";
import { getUsername } from "./members.js";
import { getCommandsWithPermission } from "./permissions.js";
import { getPollThreshold } from "./polls.js";
import {
  getMembersWithAndWithoutRoles,
  getMembersWithRoles,
  getRole,
  getRoleFromSet,
} from "./roles.js";
import {
  aboutString,
  botName,
  commandDescriptions,
  embedMessageFunctions,
  embedMessages,
  logEmbedStrings,
  logErrorFunctions,
  paginationStringFunctions,
  programMapping,
  shortStrings,
  vipStrings,
} from "./strings.js";
import {
  type Experience,
  type Link,
  type Poll,
  type Question,
  type Rule,
  type SpecialPoll,
} from "@prisma/client";
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
  type Guild,
  type GuildMember,
  inlineCode,
  type Interaction,
  italic,
  roleMention,
  type User,
  type UserContextMenuCommandInteraction,
  userMention,
} from "discord.js";

const color = await getConfigProperty("color");

// Helpers

const truncateString = (string: string | null | undefined, length: number) => {
  if (string === null || string === undefined) {
    return "";
  }

  return string.length > length
    ? string.slice(0, Math.max(0, length - 3)) + "..."
    : string;
};

const getChannel = (interaction: Interaction) => {
  if (interaction.channel === null || interaction.channel.isDMBased()) {
    return shortStrings.dm;
  }

  return channelMention(interaction.channel.id);
};

const getButtonCommand = (command?: string) => {
  switch (command) {
    case undefined:
      return logEmbedStrings.unknown;

    case "pollStats":
      return logEmbedStrings.pollStats;

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
    case "course":
      return {
        name: getButtonCommand(command),
        value: roleMention(
          getRoleFromSet(interaction.guild, "courses", args[0])?.id ??
            logEmbedStrings.unknown,
        ),
      };

    case "year":
    case "program":
    case "notification":
    case "color":
      return {
        name: getButtonCommand(command),
        value: roleMention(
          getRoleFromSet(interaction.guild, command, args[0])?.id ??
            logEmbedStrings.unknown,
        ),
      };

    case "help":
    case "exp":
    case "polls":
    case "poll":
    case "pollStats":
    case "addCourses":
    case "removeCourses":
    case "vip":
      return {
        name: getButtonCommand(command),
        value:
          args[0] === undefined ? logEmbedStrings.unknown : inlineCode(args[0]),
      };

    default:
      return {
        name: logEmbedStrings.unknown,
        value: logEmbedStrings.unknown,
      };
  }
};

const linkProfessors = (professors: string) => {
  if (professors === "") {
    return "-";
  }

  return professors
    .split("\n")
    .map((professor) => [
      professor,
      getStaff().find((staff) => professor.includes(staff.name))?.finki,
    ])
    .map(([professor, finki]) =>
      finki ? `[${professor}](${finki})` : professor,
    )
    .join("\n");
};

const fetchMessageUrl = async (
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

const transformCoursePrerequisites = (
  program: ProgramShorthand,
  semester: number,
) => {
  return getPrerequisites()
    .filter((prerequisite) => prerequisite.semester === semester)
    .filter(
      (prerequisite) =>
        prerequisite[program] === "задолжителен" ||
        prerequisite[program] === "изборен" ||
        prerequisite[program] === "нема" ||
        prerequisite[program] === "задолжителен (изб.)",
    )
    .map((prerequisite) =>
      prerequisite[program] === "нема"
        ? {
            course: prerequisite.course,
            prerequisite: shortStrings.none,
            type: "изборен",
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
    return ".".repeat(20);
  }

  const progressBar =
    "█".repeat(Math.floor(percentage / 5)) +
    (percentage - Math.floor(percentage) >= 0.5 ? "▌" : "");

  return progressBar + ".".repeat(Math.max(0, 20 - progressBar.length));
};

// Scripts

export const getColorsEmbed = async (image: string) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(embedMessages.nameColor)
    .setDescription(embedMessages.chooseNameColor)
    .setFooter({
      text: embedMessages.onlyOneOption,
    })
    .setImage(image);
};

export const getColorsComponents = () => {
  const components = [];
  const roles = getFromRoleConfig("color");

  for (let index1 = 0; index1 < roles.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roles[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`color:${roles[index2] ?? ""}`)
        .setLabel(`${index2 + 1}`)
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getCoursesEmbed = async (roleSet: string, roles: string[]) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(`${roleSet.length > 1 ? "" : embedMessages.semester} ${roleSet}`)
    .setDescription(
      roles
        .map(
          (role, index) =>
            `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
              getFromRoleConfig("courses")[role]
            }`,
        )
        .join("\n"),
    )
    .setFooter({
      text: embedMessages.multipleOptions,
    });
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

export const getCoursesAddEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(embedMessages.massCourseAdd)
    .setDescription(embedMessages.chooseSemesterMassCourseAdd)
    .setFooter({
      text: embedMessages.multipleOptions,
    });
};

export const getCoursesAddComponents = (roleSets: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roleSets.length + 5; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    if (index1 >= roleSets.length) {
      const addAllButton = new ButtonBuilder()
        .setCustomId(`addCourses:all`)
        .setLabel(embedMessages.all)
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
        .setLabel(embedMessageFunctions.semesterN(roleSets[index2]))
        .setStyle(ButtonStyle.Success);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getCoursesRemoveEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(embedMessages.massCourseRemove)
    .setDescription(embedMessages.chooseSemesterMassCourseRemove)
    .setFooter({
      text: embedMessages.multipleOptions,
    });
};

export const getCoursesRemoveComponents = (roleSets: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roleSets.length + 5; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    if (index1 >= roleSets.length) {
      const removeAllButton = new ButtonBuilder()
        .setCustomId(`removeCourses:all`)
        .setLabel(embedMessages.all)
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
        .setLabel(embedMessageFunctions.semesterN(roleSets[index2]))
        .setStyle(ButtonStyle.Danger);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getNotificationsEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(embedMessages.notifications)
    .setDescription(embedMessages.chooseNotifications)
    .setFooter({
      text: embedMessages.multipleOptions,
    });
};

export const getNotificationsComponents = () => {
  const roles = getFromRoleConfig("notification");
  const components = [];

  for (let index1 = 0; index1 < roles.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roles[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`notification:${roles[index2] ?? ""}`)
        .setLabel(roles[index2] ?? "")
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getProgramsEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Смер")
    .setDescription(embedMessages.chooseProgram)
    .setFooter({
      text: embedMessages.onlyOneOption,
    });
};

export const getProgramsComponents = () => {
  const roles = getFromRoleConfig("program");
  const components = [];

  for (let index1 = 0; index1 < roles.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (roles[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`program:${roles[index2] ?? ""}`)
        .setLabel(roles[index2] ?? "")
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getYearsEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Година на студирање")
    .setDescription(embedMessages.chooseYear)
    .setFooter({
      text: embedMessages.onlyOneOption,
    });
};

export const getYearsComponents = () => {
  const roles = getFromRoleConfig("year");
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

export const getRulesEmbed = async (rules: Rule[]) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.rules)
    .setDescription(
      `${rules
        .map(
          (value, index) =>
            `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
              value.rule
            }`,
        )
        .join("\n\n")} \n\n ${italic(embedMessages.breakRules)}.`,
    );
};

export const getVipRequestEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(vipStrings.vipRequestTitle)
    .setDescription(vipStrings.vipRequestText);
};

export const getVipRequestComponents = () => {
  const components = [];

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder()
      .setCustomId("vip:request")
      .setLabel(vipStrings.vipRequestButton)
      .setStyle(ButtonStyle.Primary),
  );
  components.push(row);

  return components;
};

export const getVipConfirmEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(vipStrings.vipAcceptedTitle)
    .setDescription(vipStrings.vipConfirm);
};

export const getVipConfirmComponents = () => {
  const components = [];

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder()
      .setCustomId("vip:confirm")
      .setLabel(vipStrings.vipAcceptButton)
      .setStyle(ButtonStyle.Success),
  );
  components.push(row);

  return components;
};

export const getVipAcknowledgeComponents = () => {
  const components = [];

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder()
      .setCustomId("vip:acknowledge")
      .setLabel(vipStrings.vipAcceptButton)
      .setStyle(ButtonStyle.Success),
  );
  components.push(row);

  return components;
};

// Commands

export const getAboutEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(botName)
    .setDescription(
      aboutString(commandMention("help"), commandMention("list questions")),
    )
    .setTimestamp();
};

export const getClassroomEmbed = async (information: Classroom) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(`${information.classroom.toString()} (${information.location})`)
    .addFields(
      {
        inline: true,
        name: shortStrings.type,
        value: information.type,
      },
      {
        inline: true,
        name: shortStrings.location,
        value: information.location,
      },
      {
        inline: true,
        name: shortStrings.floor,
        value: information.floor.toString(),
      },
      {
        inline: true,
        name: shortStrings.capacity,
        value: information.capacity.toString(),
      },
    )
    .setTimestamp();
};

export const getCourseParticipantsEmbed = async (
  information: CourseParticipants,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(information.course)
    .setDescription(embedMessages.courseParticipantsInfo)
    .addFields(
      ...Object.entries(information)
        .filter(([year]) => year !== "course")
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
    .setColor(await getConfigProperty("color"))
    .setTitle(information.course)
    .addFields(
      {
        inline: true,
        name: shortStrings.professors,
        value: linkProfessors(information.professors),
      },
      {
        inline: true,
        name: shortStrings.assistants,
        value: linkProfessors(information.assistants),
      },
    )
    .setTimestamp();
};

export const getCoursePrerequisiteEmbed = async (
  information: CoursePrerequisites,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(information.course)
    .addFields({
      inline: true,
      name: shortStrings.prerequisites,
      value:
        information.prerequisite === ""
          ? shortStrings.none
          : information.prerequisite,
    })
    .setTimestamp();
};

export const getCourseInfoEmbed = async (information: CourseInformation) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(information.course)
    .addFields(
      {
        inline: true,
        name: shortStrings.accreditation,
        value: `[${shortStrings.link}](${information.link})`,
      },
      {
        inline: true,
        name: shortStrings.code,
        value: information.code,
      },
      {
        inline: true,
        name: shortStrings.level,
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
      .setColor(await getConfigProperty("color"))
      .setTitle(course)
      .setDescription(embedMessages.courseSummaryInfo),
    new EmbedBuilder().setColor(await getConfigProperty("color")).addFields(
      {
        name: shortStrings.prerequisites,
        value:
          prerequisite === undefined || prerequisite.prerequisite === ""
            ? shortStrings.none
            : prerequisite.prerequisite,
      },
      {
        inline: true,
        name: shortStrings.accreditation,
        value:
          info === undefined
            ? shortStrings.unknown
            : `[${shortStrings.link}](${info.link})`,
      },
      {
        inline: true,
        name: shortStrings.code,
        value: info === undefined ? shortStrings.unknown : info.code,
      },
      {
        inline: true,
        name: shortStrings.level,
        value:
          info === undefined ? shortStrings.unknown : info.level.toString(),
      },
    ),
    new EmbedBuilder().setColor(await getConfigProperty("color")).addFields(
      {
        inline: true,
        name: shortStrings.professors,
        value:
          professors === undefined
            ? shortStrings.unknown
            : linkProfessors(professors.professors),
      },
      {
        inline: true,
        name: shortStrings.assistants,
        value:
          professors === undefined
            ? shortStrings.unknown
            : linkProfessors(professors.assistants),
      },
    ),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setDescription(embedMessages.courseParticipantsInfo)
      .addFields(
        ...Object.entries(participants ?? {})
          .filter(([year]) => year !== "course")
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
  const elective = courses.filter((course) => course.type === "изборен");
  const mandatory = courses.filter(
    (course) =>
      course.type === "задолжителен" || course.type === "задолжителен (изб.)",
  );

  return [
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle(`Предмети за ${program}, семестар ${semester}`)
      .setDescription("Предусловите за предметите се под истиот реден број."),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Задолжителни")
      .setDescription(
        mandatory.length === 0
          ? shortStrings.none
          : mandatory
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                    course.course
                  } ${
                    course.type === "задолжителен (изб.)"
                      ? "(изборен за 3 год. студии)"
                      : ""
                  }`,
              )
              .join("\n"),
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Задолжителни - предуслови")
      .setDescription(
        mandatory.length === 0
          ? shortStrings.none
          : mandatory
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                    course.prerequisite === ""
                      ? shortStrings.none
                      : course.prerequisite
                  }`,
              )
              .join("\n"),
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Изборни")
      .setDescription(
        elective.length === 0
          ? shortStrings.none
          : elective
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                    course.course
                  }`,
              )
              .join("\n"),
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Изборни - предуслови")
      .setDescription(
        elective.length === 0
          ? shortStrings.none
          : elective
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                    course.prerequisite === ""
                      ? shortStrings.none
                      : course.prerequisite
                  }`,
              )
              .join("\n"),
      )
      .setTimestamp(),
  ];
};

export const getCoursesPrerequisiteEmbed = async (course: string) => {
  const courses = getPrerequisites().filter((prerequisite) =>
    prerequisite.prerequisite.toLowerCase().includes(course.toLowerCase()),
  );

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(`Предмети со предуслов ${course}`)
    .setDescription(
      courses.length === 0
        ? shortStrings.none
        : courses
            .map(
              (prerequisite, index) =>
                `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                  prerequisite.course
                }`,
            )
            .join("\n"),
    )
    .setTimestamp();
};

export const getStaffEmbed = async (information: Staff) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(`${information.name}`)
    .addFields(
      {
        inline: true,
        name: "Звање",
        value: information.title,
      },
      {
        inline: true,
        name: "Позиција",
        value: information.position,
      },
      {
        name: "Електронска пошта",
        value: information.email,
      },
      {
        inline: true,
        name: "ФИНКИ",
        value: information.finki === "" ? "-" : `[Линк](${information.finki})`,
      },
      {
        inline: true,
        name: "Courses",
        value:
          information.courses === "" ? "-" : `[Линк](${information.courses})`,
      },
      {
        inline: true,
        name: "Распоред",
        value:
          information.raspored === "" ? "-" : `[Линк](${information.raspored})`,
      },
      {
        inline: true,
        name: "Консултации",
        value:
          information.konsultacii === ""
            ? "-"
            : `[Линк](${information.konsultacii})`,
      },
    )
    .setTimestamp();
};

export const getStudentInfoEmbed = async (member: GuildMember) => {
  const yearRole = member.roles.cache.find((role) =>
    getFromRoleConfig("year").includes(role.name),
  );
  const programRole = member.roles.cache.find((role) =>
    getFromRoleConfig("program").includes(role.name),
  );
  const colorRole = member.roles.cache.find((role) =>
    getFromRoleConfig("color").includes(role.name),
  );
  const levelRole = member.roles.cache.find((role) =>
    getFromRoleConfig("level").includes(role.name),
  );
  const notificationRoles = member.roles.cache
    .filter((role) => getFromRoleConfig("notification").includes(role.name))
    .map((role) => roleMention(role.id))
    .join("\n");
  const courseRoles = member.roles.cache
    .filter((role) =>
      Object.keys(getFromRoleConfig("courses")).includes(role.name),
    )
    .map(
      (role) =>
        `${roleMention(role.id)}: ${getFromRoleConfig("courses")[role.name]}`,
    )
    .join("\n");
  const other = member.roles.cache
    .filter((role) => getFromRoleConfig("other").includes(role.name))
    .map((role) => roleMention(role.id))
    .join("\n");

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setAuthor({
      iconURL: member.user.displayAvatarURL(),
      name: member.user.tag,
    })
    .setTitle(embedMessages.studentInformation)
    .addFields(
      {
        inline: true,
        name: shortStrings.year,
        value:
          yearRole === undefined ? shortStrings.none : roleMention(yearRole.id),
      },
      {
        inline: true,
        name: shortStrings.program,
        value:
          programRole === undefined
            ? shortStrings.none
            : roleMention(programRole.id),
      },
      {
        inline: true,
        name: shortStrings.color,
        value:
          colorRole === undefined
            ? shortStrings.none
            : roleMention(colorRole.id),
      },
      {
        inline: true,
        name: shortStrings.level,
        value:
          levelRole === undefined
            ? shortStrings.none
            : roleMention(levelRole.id),
      },
      {
        inline: true,
        name: shortStrings.notifications,
        value: notificationRoles === "" ? shortStrings.none : notificationRoles,
      },
      {
        name: shortStrings.courses,
        value: courseRoles === "" ? shortStrings.none : courseRoles,
      },
      {
        name: shortStrings.other,
        value: other === "" ? shortStrings.none : other,
      },
    )
    .setTimestamp();
};

export const getVipEmbed = async (interaction: ChatInputCommandInteraction) => {
  await interaction.guild?.members.fetch();

  const vipRole = getRole("vip");
  const vipMembers = [];

  for (const member of vipRole?.members.values() ?? []) {
    const user = await interaction.guild?.members.fetch(member.user.id);
    vipMembers.push(user);
  }

  const adminRole = getRole("admin");
  const adminMembers = [];

  for (const member of adminRole?.members.values() ?? []) {
    const user = await interaction.guild?.members.fetch(member.user.id);
    adminMembers.push(user);
  }

  return [
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Состав"),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle(`ВИП: ${vipMembers.length}`)
      .setDescription(
        vipMembers.length === 0
          ? "Нема членови на ВИП."
          : vipMembers
              .map(
                (member) =>
                  `${member?.user.tag} (${userMention(
                    member?.user.id as string,
                  )})`,
              )
              .join("\n"),
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle(`Админ тим: ${adminMembers.length}`)
      .setDescription(
        adminMembers.length === 0
          ? "Нема администратори."
          : adminMembers
              .map(
                (member) =>
                  `${member?.user.tag} (${userMention(
                    member?.user.id as string,
                  )})`,
              )
              .join("\n"),
      )
      .setTimestamp(),
  ];
};

export const getVipInvitedEmbed = async () => {
  const councilRoleId = await getRoleProperty("council");
  const boosterRoleId = await getRoleProperty("booster");
  const contributorRoleId = await getRoleProperty("contributor");
  const adminRoleId = await getRoleProperty("admin");
  const vipRoleId = await getRoleProperty("vip");

  const memberIds = await getMembersWithAndWithoutRoles(
    [councilRoleId, boosterRoleId, contributorRoleId],
    [adminRoleId, vipRoleId],
  );
  const guild = client.guilds.cache.get(await getConfigProperty("guild"));
  const members = await Promise.all(
    memberIds.map(async (memberId) => await guild?.members.fetch(memberId)),
  );

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(`ВИП поканети: ${memberIds.length}`)
    .setDescription(
      members.length === 0
        ? "Нема членови на ВИП поканети."
        : members
            .map(
              (member) =>
                `${member?.user.tag} (${userMention(
                  member?.user.id as string,
                )})`,
            )
            .join("\n"),
    )
    .setTimestamp();
};

export const getExperienceEmbed = async (experience: Experience) => {
  const guild = client.guilds.cache.get(await getConfigProperty("guild"));
  const user = guild?.members.cache.get(experience.userId)?.user as User;

  if (guild === undefined) {
    return new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setAuthor({
        iconURL: user.displayAvatarURL(),
        name: user.tag,
      })
      .setTitle("Активност")
      .setDescription("Настана грешка.")
      .setTimestamp();
  }

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setAuthor({
      iconURL: user.displayAvatarURL(),
      name: user.tag,
    })
    .setTitle("Активност")
    .addFields(
      {
        inline: true,
        name: "Ниво",
        value: experience.level.toString(),
      },
      {
        inline: true,
        name: "Поени",
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
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.activity)
    .addFields(
      await Promise.all(
        experience.slice(0, perPage).map(async (exp, index) => ({
          name: "\u200B",
          value: `${index + 1}. ${await getUsername(exp.userId)} (${userMention(
            exp.userId,
          )}): ${shortStrings.level}: ${exp.level} | ${shortStrings.points}: ${
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
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.activity)
    .addFields(
      await Promise.all(
        experience
          .slice(perPage * page, perPage * (page + 1))
          .map(async (exp, index) => ({
            name: "\u200B",
            value: `${perPage * page + index + 1}. ${await getUsername(
              exp.userId,
            )} (${userMention(exp.userId)}): ${shortStrings.level}: ${
              exp.level
            } | ${shortStrings.points}: ${exp.experience}`,
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
    .setColor(await getConfigProperty("color"))
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
        name === "" ||
        url === ""
      ) {
        break;
      }

      const button = new ButtonBuilder()
        .setURL(url.startsWith("http") ? url : `https://${url}`)
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
    .setColor(await getConfigProperty("color"))
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
        .setURL(link.url.startsWith("http") ? link.url : `https://${link.url}`)
        .setLabel(shortStrings.link)
        .setStyle(ButtonStyle.Link),
    ),
  ];
};

export const getListQuestionsEmbed = async (questions: Question[]) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.questions)
    .setDescription(
      `${embedMessageFunctions.allQuestions(
        commandMention("faq"),
      )}\n\n${questions
        .map(
          (question, index) =>
            `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
              question.name
            }`,
        )
        .join("\n")}`,
    )
    .setTimestamp();
};

export const getListLinksEmbed = async (links: Link[]) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.links)
    .setDescription(
      `${embedMessageFunctions.allLinks(commandMention("link"))}\n\n${links
        .map(
          (link, index) =>
            `${inlineCode((index + 1).toString().padStart(2, "0"))} [${
              link.name
            }](${link.url})`,
        )
        .join("\n")}`,
    )
    .setTimestamp();
};

// Help

export const getHelpFirstPageEmbed = async (
  member: GuildMember,
  commandsPerPage: number = 8,
) => {
  const commands = getCommandsWithPermission(member);

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.commands)
    .setDescription(embedMessages.allCommands)
    .addFields(
      ...commands.slice(0, commandsPerPage).map((command) => ({
        name: commandMention(command),
        value: commandDescriptions[command as keyof typeof commandDescriptions],
      })),
    )
    .setFooter({
      text: paginationStringFunctions.commandPage(
        1,
        Math.max(1, Math.ceil(commands.length / commandsPerPage)),
        commands.length,
      ),
    })
    .setTimestamp();
};

export const getHelpNextPageEmbed = async (
  member: GuildMember,
  page: number,
  commandsPerPage: number = 8,
) => {
  const commands = getCommandsWithPermission(member);

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.commands)
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

// Polls

export const getPollEmbed = async (poll: PollWithOptions) => {
  const votes = (await getPollVotesByPollId(poll.id))?.length ?? 0;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setAuthor(
      poll.done
        ? {
            name: embedMessages.pollEnded,
          }
        : null,
    )
    .setTitle(truncateString(poll.title, 256))
    .setDescription(
      `${italic(truncateString(poll.description, 1_000))}\n${codeBlock(
        (
          await Promise.all(
            poll.options.map(async (option, index) => {
              const optionVotes =
                (await getPollVotesByOptionId(option.id))?.length ?? 0;
              const fraction = (optionVotes / votes) * 100;
              const bar =
                votes === 0
                  ? generatePollPercentageBar(0)
                  : generatePollPercentageBar(fraction);

              return `${(index + 1)
                .toString()
                .padStart(2, "0")} ${option.name.padEnd(
                Math.max(...poll.options.map((opt) => opt.name.length)),
              )} - [${bar}] - ${optionVotes} [${
                votes > 0 ? fraction.toFixed(2).padStart(5, "0") : "00"
              }%]`;
            }),
          )
        ).join("\n"),
      )}${
        poll.done
          ? `\n${shortStrings.result}: ${inlineCode(
              poll.decision ??
                (await getMostPopularOptionByPollId(poll.id))?.name ??
                "-",
            )}\n`
          : ""
      }`,
    )
    .setFooter({
      text: `${shortStrings.poll}: ${poll.id}`,
    })
    .setTimestamp();
};

export const getPollComponents = (poll: PollWithOptions) => {
  const components = [];
  const firstRow = new ActionRowBuilder<ButtonBuilder>();
  const firstButtons = [];
  const highestIndex = Math.min(poll.options.length, 4);

  const infoButton = new ButtonBuilder()
    .setCustomId(`poll:${poll.id}:info`)
    .setLabel(embedMessages.pollInformation)
    .setStyle(ButtonStyle.Secondary);

  firstButtons.push(infoButton);

  for (let index = 0; index < highestIndex; index++) {
    const option = poll.options[index];
    const button = new ButtonBuilder()
      .setCustomId(`poll:${poll.id}:${option?.id}`)
      .setLabel(truncateString(`${index + 1}. ${option?.name}`, 80))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(poll.done);

    firstButtons.push(button);
  }

  firstRow.addComponents(firstButtons);
  components.push(firstRow);

  if (highestIndex === 4) {
    for (let index1 = highestIndex; index1 < poll.options.length; index1 += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons = [];

      for (let index2 = index1; index2 < index1 + 5; index2++) {
        const option = poll.options[index2];

        if (option === undefined) {
          break;
        }

        const button = new ButtonBuilder()
          .setCustomId(`poll:${poll.id}:${option.id}`)
          .setLabel(truncateString(`${index2 + 1}. ${option.name}`, 80))
          .setStyle(ButtonStyle.Primary)
          .setDisabled(poll.done);

        buttons.push(button);
      }

      row.addComponents(buttons);
      components.push(row);
    }
  }

  return components;
};

export const getPollInfoEmbed = async (guild: Guild, poll: Poll) => {
  const votes = (await getPollVotesByPollId(poll.id))?.length ?? 0;
  const voters = await getMembersWithRoles(guild, ...poll.roles);
  const threshold = await getPollThreshold(poll.id);
  const turnout = `(${((votes / voters.length) * 100).toFixed(2)}%)`;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(poll.title)
    .addFields(
      {
        inline: true,
        name: shortStrings.multipleChoice,
        value: poll.multiple ? shortStrings.yes : shortStrings.no,
      },
      {
        inline: true,
        name: shortStrings.anonymous,
        value: poll.anonymous ? shortStrings.yes : shortStrings.no,
      },
      {
        inline: true,
        name: shortStrings.open,
        value: poll.open ? shortStrings.yes : shortStrings.no,
      },
      {
        inline: true,
        name: shortStrings.author,
        value: userMention(poll.userId),
      },
      {
        inline: true,
        name: shortStrings.votes,
        value: `${votes} ${poll.roles.length > 0 ? turnout : ""}`,
      },
      {
        inline: true,
        name: shortStrings.rightToVote,
        value:
          poll.roles.length === 0
            ? shortStrings.all
            : (
                await getMembersWithRoles(guild, ...poll.roles)
              ).length.toString(),
      },
      {
        inline: true,
        name: shortStrings.requiredMajority,
        value: `${poll.threshold * 100}% (${threshold})`,
      },
      {
        inline: true,
        name: shortStrings.roles,
        value:
          poll.roles.length > 0
            ? poll.roles.map((role) => roleMention(role)).join(", ")
            : shortStrings.none,
      },
      {
        inline: true,
        name: "\u200B",
        value: "\u200B",
      },
    )
    .setFooter({
      text: `${shortStrings.poll}: ${poll.id}`,
    })
    .setTimestamp();
};

export const getPollStatsComponents = (poll: PollWithOptions) => {
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

export const getPollListFirstPageEmbed = async (
  polls: Poll[],
  all: boolean = false,
  pollsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.polls)
    .setDescription(embedMessageFunctions.allPolls(all))
    .addFields(
      ...polls.slice(0, pollsPerPage).map((poll) => ({
        name:
          all && poll.done
            ? `${poll.title} (${shortStrings.closed})`
            : poll.title,
        value: poll.id,
      })),
    )
    .setFooter({
      text: paginationStringFunctions.pollPage(
        1,
        Math.max(1, Math.ceil(polls.length / pollsPerPage)),
        polls.length,
      ),
    })
    .setTimestamp();
};

export const getPollListNextPageEmbed = async (
  polls: Poll[],
  page: number,
  all: boolean = false,
  pollsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.polls)
    .setDescription(embedMessageFunctions.allPolls(all))
    .addFields(
      ...polls
        .slice(pollsPerPage * page, pollsPerPage * (page + 1))
        .map((poll) => ({
          name:
            all && poll.done
              ? `${poll.title} (${shortStrings.closed})`
              : poll.title,
          value: poll.id,
        })),
    )
    .setFooter({
      text: paginationStringFunctions.pollPage(
        page + 1,
        Math.max(1, Math.ceil(polls.length / pollsPerPage)),
        polls.length,
      ),
    })
    .setTimestamp();
};

export const getSpecialPollListFirstPageEmbed = async (
  polls: SpecialPoll[],
  pollsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.polls)
    .setDescription(embedMessages.allSpecialPolls)
    .addFields(
      ...(await Promise.all(
        polls.slice(0, pollsPerPage).map(async (poll) => ({
          name: `${poll.type} (${await getUsername(poll.userId)})`,
          value: poll.id,
        })),
      )),
    )
    .setFooter({
      text: paginationStringFunctions.pollPage(
        1,
        Math.max(1, Math.ceil(polls.length / pollsPerPage)),
        polls.length,
      ),
    })
    .setTimestamp();
};

export const getSpecialPollListNextPageEmbed = async (
  polls: SpecialPoll[],
  page: number,
  pollsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.polls)
    .setDescription(embedMessages.allSpecialPolls)
    .addFields(
      ...(await Promise.all(
        polls
          .slice(pollsPerPage * page, pollsPerPage * (page + 1))
          .map(async (poll) => ({
            name: `${poll.type} (${await getUsername(poll.userId)})`,
            value: poll.id,
          })),
      )),
    )
    .setFooter({
      text: paginationStringFunctions.pollPage(
        page + 1,
        Math.max(1, Math.ceil(polls.length / pollsPerPage)),
        polls.length,
      ),
    })
    .setTimestamp();
};

// Pagination

export const getPaginationComponents = (
  name: string,
  position: PaginationPosition = "none",
) => {
  if (position === "none") {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${name}:first`)
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:previous`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:next`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:last`)
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
    );
  }

  if (position === "start") {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${name}:first`)
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:previous`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:next`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:last`)
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Primary),
    );
  } else if (position === "middle") {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${name}:first`)
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:previous`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:next`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:last`)
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Primary),
    );
  } else {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${name}:first`)
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:previous`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:next`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:last`)
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
    );
  }
};

// Logs

export const getChatInputCommandEmbed = async (
  interaction: ChatInputCommandInteraction,
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(logEmbedStrings.chatInputInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        inline: true,
        name: logEmbedStrings.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: logEmbedStrings.channel,
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: logEmbedStrings.command,
        value: inlineCode(
          interaction.toString().length > 300
            ? interaction.toString().slice(0, 300)
            : interaction.toString(),
        ),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};

export const getUserContextMenuCommandEmbed = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(logEmbedStrings.userContextMenuInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        name: logEmbedStrings.author,
        value: userMention(interaction.user.id),
      },
      {
        name: logEmbedStrings.channel,
        value: getChannel(interaction),
      },
      {
        name: logEmbedStrings.command,
        value: inlineCode(interaction.commandName),
      },
      {
        name: logEmbedStrings.target,
        value: userMention(interaction.targetUser.id),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};

export const getButtonEmbed = (
  interaction: ButtonInteraction,
  command: string = "unknown",
  args: string[] = [],
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(logEmbedStrings.buttonInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: logEmbedStrings.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: logEmbedStrings.channel,
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: logEmbedStrings.command,
        value: getButtonCommand(command),
      },
      {
        inline: true,
        ...getButtonInfo(interaction, command, args),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};

export const getAutocompleteEmbed = (interaction: AutocompleteInteraction) => {
  const focused = interaction.options.getFocused(true);

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(logEmbedStrings.autocompleteInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: logEmbedStrings.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: logEmbedStrings.channel,
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: logEmbedStrings.command,
        value: inlineCode(focused.name),
      },
      {
        inline: true,
        name: logEmbedStrings.value,
        value:
          focused.value === ""
            ? logEmbedStrings.empty
            : inlineCode(focused.value),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};
