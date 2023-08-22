import { getLinks } from "../data/Link.js";
import { getMostPopularOptionByPollId } from "../data/PollOption.js";
import {
  getPollVotesByOptionId,
  getPollVotesByPollId,
} from "../data/PollVote.js";
import { getQuestions } from "../data/Question.js";
import { type Classroom } from "../types/Classroom.js";
import { type CourseInformation } from "../types/CourseInformation.js";
import { type CourseParticipants } from "../types/CourseParticipants.js";
import { type CoursePrerequisites } from "../types/CoursePrerequisites.js";
import { type CourseStaff } from "../types/CourseStaff.js";
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
  getRules,
  getStaff,
} from "./config.js";
import { logger } from "./logger.js";
import { getUsername } from "./members.js";
import {
  getCommandsWithPermission,
  hasCommandPermission,
} from "./permissions.js";
import {
  getMembersWithAndWithoutRoles,
  getMembersWithRoles,
  getRole,
  getRoleFromSet,
} from "./roles.js";
import { commandDescriptions, programMapping, vipStrings } from "./strings.js";
import {
  type Experience,
  type Link,
  type Poll,
  type PollVote,
  type Question,
  type VipPoll,
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
  hyperlink,
  inlineCode,
  type Interaction,
  italic,
  type Role,
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
    return "DM";
  }

  return channelMention(interaction.channel.id);
};

const getButtonCommand = (command?: string) => {
  switch (command) {
    case undefined:
      return "Unknown";
    case "pollStats":
      return "Poll Stats";
    default:
      return command[0]?.toUpperCase() + command.slice(1);
  }
};

const getButtonInfo = (
  interaction: ButtonInteraction,
  command: string,
  args: string[]
) => {
  switch (command) {
    case "course":
      return {
        name: getButtonCommand(command),
        value: roleMention(
          getRoleFromSet(interaction.guild, "courses", args[0])?.id ?? "Unknown"
        ),
      };
    case "year":
    case "program":
    case "notification":
    case "color":
      return {
        name: getButtonCommand(command),
        value: roleMention(
          getRoleFromSet(interaction.guild, command, args[0])?.id ?? "Unknown"
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
        value: args[0] === undefined ? "Unknown" : inlineCode(args[0]),
      };
    default:
      return {
        name: "Unknown",
        value: "Unknown",
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
      finki ? `[${professor}](${finki})` : professor
    )
    .join("\n");
};

const fetchMessageUrl = async (
  interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction
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
      `Failed to fetch message URL for interaction by ${interaction.user.tag} in ${interaction.channel.name}`
    );
    return {};
  }
};

const transformCoursePrerequisites = (
  program: ProgramShorthand,
  semester: number
) => {
  return getPrerequisites()
    .filter((prerequisite) => prerequisite.semester === semester)
    .filter(
      (prerequisite) =>
        prerequisite[program] === "задолжителен" ||
        prerequisite[program] === "изборен" ||
        prerequisite[program] === "нема" ||
        prerequisite[program] === "задолжителен (изб.)"
    )
    .map((prerequisite) =>
      prerequisite[program] === "нема"
        ? {
            course: prerequisite.course,
            prerequisite: "Нема",
            type: "изборен",
          }
        : {
            course: prerequisite.course,
            prerequisite: prerequisite.prerequisite,
            type: prerequisite[program],
          }
    );
};

export const generatePollPercentageBar = (percentage: number) => {
  if (percentage === 0) {
    return ".".repeat(20);
  }

  const pb =
    "█".repeat(Math.floor(percentage / 5)) +
    (percentage - Math.floor(percentage) >= 0.5 ? "▌" : "");
  return pb + ".".repeat(Math.max(0, 20 - pb.length));
};

// Scripts

export const getColorsEmbed = async (image: string) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Боја на име")
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription("Изберете боја за вашето име.")
    .setFooter({
      text: "(може да изберете само една опција, секоја нова опција ја заменува старата)",
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
    .setTitle(`${roleSet.length > 1 ? "" : "Семестар"} ${roleSet}`)
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription(
      roles
        .map(
          (role, index_) =>
            `${inlineCode((index_ + 1).toString().padStart(2, "0"))} ${
              getFromRoleConfig("courses")[role]
            }`
        )
        .join("\n")
    )
    .setFooter({ text: "(може да изберете повеќе опции)" });
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
    .setTitle("Масовно земање предмети")
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription(
      "Земете предмети од одредени семестри чии канали сакате да ги гледате."
    )
    .setFooter({ text: "(може да изберете повеќе опции)" });
};

export const getCoursesAddComponents = (roleSets: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roleSets.length + 5; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    if (index1 >= roleSets.length) {
      const addAllButton = new ButtonBuilder()
        .setCustomId(`addCourses:all`)
        .setLabel("Сите")
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

export const getCoursesRemoveEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Масовно отстранување предмети")
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription(
      "Отстранете предмети од одредени семестри чии канали не сакате да ги гледате."
    )
    .setFooter({ text: "(може да изберете повеќе опции)" });
};

export const getCoursesRemoveComponents = (roleSets: string[]) => {
  const components = [];

  for (let index1 = 0; index1 < roleSets.length + 5; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    if (index1 >= roleSets.length) {
      const removeAllButton = new ButtonBuilder()
        .setCustomId(`removeCourses:all`)
        .setLabel("Сите")
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

export const getNotificationsEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Нотификации")
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription(
      "Изберете за кои типови на објави сакате да добиете нотификации."
    )
    .setFooter({ text: "(може да изберете повеќе опции)" });
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
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription("Изберете го смерот на кој студирате.")
    .setFooter({
      text: "(може да изберете само една опција, секоја нова опција ја заменува старата)",
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
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription("Изберете ја годината на студирање.")
    .setFooter({
      text: "(може да изберете само една опција, секоја нова опција ја заменува старата)",
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

export const getRulesEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Правила")
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription(
      `${getRules()
        .map(
          (value, index) =>
            `${inlineCode((index + 1).toString().padStart(2, "0"))} ${value}`
        )
        .join("\n\n")} \n\n ${italic(
        "Евентуално кршење на правилата може да доведе до санкции"
      )}.`
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
      .setStyle(ButtonStyle.Primary)
  );
  components.push(row);

  return components;
};

export const getVipConfirmEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Заклетва")
    .setDescription(vipStrings.vipConfirm);
};

export const getVipConfirmComponents = () => {
  const components = [];

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder()
      .setCustomId("vip:confirm")
      .setLabel("Прифаќам")
      .setStyle(ButtonStyle.Success)
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
      .setLabel("Прифаќам")
      .setStyle(ButtonStyle.Success)
  );
  components.push(row);

  return components;
};

// Commands

export const getAboutEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("ФИНКИ Discord бот")
    .setThumbnail(await getConfigProperty("logo"))
    .setDescription(
      `Овој бот е развиен од ${userMention(
        "198249751001563136"
      )} за потребите на Discord серверот на студентите на ФИНКИ. Ботот е open source и може да се најде на ${hyperlink(
        "GitHub",
        "https://github.com/Delemangi/finki-discord-bot"
      )}. Ако имате било какви прашања, предлози или проблеми, контактирајте нè на Discord или на GitHub. \n\nНапишете ${commandMention(
        "help"
      )} за да ги видите сите достапни команди, или ${commandMention(
        "list questions"
      )} за да ги видите сите достапни прашања.`
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
        name: "Тип",
        value: information.type,
      },
      {
        inline: true,
        name: "Локација",
        value: information.location,
      },
      {
        inline: true,
        name: "Спрат",
        value: information.floor.toString(),
      },
      {
        inline: true,
        name: "Капацитет",
        value: information.capacity.toString(),
      }
    )
    .setTimestamp();
};

export const getCourseParticipantsEmbed = async (
  information: CourseParticipants
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(information.course)
    .addFields(
      {
        name: "Број на запишани студенти",
        value: "\u200B",
      },
      ...Object.entries(information)
        .filter(([year]) => year !== "course")
        .map(([year, participants]) => ({
          inline: true,
          name: year,
          value: participants.toString(),
        }))
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
        name: "Професори",
        value: linkProfessors(information.professors),
      },
      {
        inline: true,
        name: "Асистенти",
        value: linkProfessors(information.assistants),
      }
    )
    .setTimestamp();
};

export const getCoursePrerequisiteEmbed = async (
  information: CoursePrerequisites
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(information.course)
    .addFields({
      inline: true,
      name: "Предуслови",
      value:
        information.prerequisite === "" ? "Нема" : information.prerequisite,
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
        name: "Информации",
        value: `[Линк](${information.link})`,
      },
      {
        inline: true,
        name: "Код",
        value: information.code,
      },
      {
        inline: true,
        name: "Ниво",
        value: information.level.toString(),
      }
    )
    .setTimestamp();
};

export const getCourseSummaryEmbed = async (course: string | null) => {
  if (course === null) {
    return [
      new EmbedBuilder().setDescription("Нема информации за овој предмет."),
    ];
  }

  const info = getInformation().find(
    (item) => item.course.toLowerCase() === course?.toLowerCase()
  );
  const prerequisite = getPrerequisites().find(
    (item) => item.course.toLowerCase() === course?.toLowerCase()
  );
  const professors = getProfessors().find(
    (item) => item.course.toLowerCase() === course?.toLowerCase()
  );
  const participants = getParticipants().find(
    (item) => item.course.toLowerCase() === course?.toLowerCase()
  );

  return [
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle(course)
      .setDescription("Ова се сите достапни информации за предметот."),
    new EmbedBuilder().setColor(await getConfigProperty("color")).addFields(
      {
        name: "Предуслови",
        value:
          prerequisite === undefined || prerequisite.prerequisite === ""
            ? "Нема"
            : prerequisite.prerequisite,
      },
      {
        inline: true,
        name: "Информации",
        value: info === undefined ? "-" : `[Линк](${info.link})`,
      },
      {
        inline: true,
        name: "Код",
        value: info === undefined ? "-" : info.code,
      },
      {
        inline: true,
        name: "Ниво",
        value: info === undefined ? "-" : info.level.toString(),
      }
    ),
    new EmbedBuilder().setColor(await getConfigProperty("color")).addFields(
      {
        inline: true,
        name: "Професори",
        value:
          professors === undefined
            ? "-"
            : linkProfessors(professors.professors),
      },
      {
        inline: true,
        name: "Асистенти",
        value:
          professors === undefined
            ? "-"
            : linkProfessors(professors.assistants),
      }
    ),
    new EmbedBuilder().setColor(await getConfigProperty("color")).addFields(
      {
        name: "Број на запишани студенти",
        value: "\u200B",
      },
      ...Object.entries(participants ?? {})
        .filter(([year]) => year !== "course")
        .map(([year, part]) => ({
          inline: true,
          name: year,
          value: part.toString(),
        }))
    ),
  ];
};

export const getCoursesProgramEmbed = async (
  program: ProgramName,
  semester: number
) => {
  const courses = transformCoursePrerequisites(
    programMapping[program],
    semester
  );
  const elective = courses.filter((course) => course.type === "изборен");
  const mandatory = courses.filter(
    (course) =>
      course.type === "задолжителен" || course.type === "задолжителен (изб.)"
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
          ? "Нема"
          : mandatory
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                    course.course
                  } ${
                    course.type === "задолжителен (изб.)"
                      ? "(изборен за 3 год. студии)"
                      : ""
                  }`
              )
              .join("\n")
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Задолжителни - предуслови")
      .setDescription(
        mandatory.length === 0
          ? "Нема"
          : mandatory
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                    course.prerequisite === "" ? "Нема" : course.prerequisite
                  }`
              )
              .join("\n")
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Изборни")
      .setDescription(
        elective.length === 0
          ? "Нема"
          : elective
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                    course.course
                  }`
              )
              .join("\n")
      ),
    new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Изборни - предуслови")
      .setDescription(
        elective.length === 0
          ? "Нема"
          : elective
              .map(
                (course, index) =>
                  `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                    course.prerequisite === "" ? "Нема" : course.prerequisite
                  }`
              )
              .join("\n")
      )
      .setTimestamp(),
  ];
};

export const getCoursesPrerequisiteEmbed = async (course: string) => {
  const courses = getPrerequisites().filter((prerequisite) =>
    prerequisite.prerequisite.toLowerCase().includes(course.toLowerCase())
  );

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(`Предмети со предуслов ${course}`)
    .setDescription(
      courses.length === 0
        ? "Нема"
        : courses
            .map(
              (prerequisite, index) =>
                `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                  prerequisite.course
                }`
            )
            .join("\n")
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
      }
    )
    .setTimestamp();
};

export const getStudentInfoEmbed = async (
  member: GuildMember | null | undefined
) => {
  if (member === null || member === undefined) {
    return new EmbedBuilder()
      .setColor(await getConfigProperty("color"))
      .setTitle("Информации за студентот")
      .setDescription("Студентот не постои.");
  }

  const yearRole = member.roles.cache.find((role) =>
    getFromRoleConfig("year").includes(role.name)
  );
  const programRole = member.roles.cache.find((role) =>
    getFromRoleConfig("program").includes(role.name)
  );
  const colorRole = member.roles.cache.find((role) =>
    getFromRoleConfig("color").includes(role.name)
  );
  const levelRole = member.roles.cache.find((role) =>
    getFromRoleConfig("level").includes(role.name)
  );
  const notificationRoles = member.roles.cache
    .filter((role) => getFromRoleConfig("notification").includes(role.name))
    .map((role) => roleMention(role.id))
    .join("\n");
  const courseRoles = member.roles.cache
    .filter((role) =>
      Object.keys(getFromRoleConfig("courses")).includes(role.name)
    )
    .map(
      (role) =>
        `${roleMention(role.id)}: ${getFromRoleConfig("courses")[role.name]}`
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
    .setTitle("Информации за студентот")
    .addFields(
      {
        inline: true,
        name: "Година",
        value: yearRole === undefined ? "Нема" : roleMention(yearRole.id),
      },
      {
        inline: true,
        name: "Смер",
        value: programRole === undefined ? "Нема" : roleMention(programRole.id),
      },
      {
        inline: true,
        name: "Боја",
        value: colorRole === undefined ? "Нема" : roleMention(colorRole.id),
      },
      {
        inline: true,
        name: "Ниво",
        value: levelRole === undefined ? "Нема" : roleMention(levelRole.id),
      },
      {
        inline: true,
        name: "Нотификации",
        value: notificationRoles === "" ? "Нема" : notificationRoles,
      },
      {
        name: "Предмети",
        value: courseRoles === "" ? "Нема" : courseRoles,
      },
      {
        name: "Друго",
        value: other === "" ? "Нема" : other,
      }
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
                    member?.user.id as string
                  )})`
              )
              .join("\n")
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
                    member?.user.id as string
                  )})`
              )
              .join("\n")
      )
      .setTimestamp(),
  ];
};

export const getVipInvitedEmbed = async () => {
  const vipInvitedRole = getRole("vipInvited") as Role;
  const boosterRole = getRole("booster") as Role;
  const contributorRole = getRole("contributor") as Role;
  const adminRole = getRole("admin") as Role;
  const vipRole = getRole("vip") as Role;

  const memberIds = await getMembersWithAndWithoutRoles(
    [vipInvitedRole.id, boosterRole.id, contributorRole.id],
    [adminRole.id, vipRole.id]
  );
  const guild = client.guilds.cache.get(await getConfigProperty("guild"));
  const members = await Promise.all(
    memberIds.map(async (memberId) => await guild?.members.fetch(memberId))
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
                  member?.user.id as string
                )})`
            )
            .join("\n")
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
      }
    )
    .setTimestamp();
};

export const getExperienceLeaderboardFirstPageEmbed = async (
  experience: Experience[],
  all: number | null,
  perPage: number = 8
) => {
  const total = experience.length;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Активност")
    .addFields(
      await Promise.all(
        experience.slice(0, perPage).map(async (exp, index) => ({
          name: "\u200B",
          value: `${index + 1}. ${await getUsername(exp.userId)} (${userMention(
            exp.userId
          )}): Ниво: ${exp.level} | Поени: ${exp.experience}`,
        }))
      )
    )
    .setFooter({
      text: `Страна: 1 / ${Math.max(
        1,
        Math.ceil(total / perPage)
      )}  •  Членови: ${total} / ${all ?? "-"}`,
    })
    .setTimestamp();
};

export const getExperienceLeaderboardNextPageEmbed = async (
  experience: Experience[],
  page: number,
  all: number | null,
  perPage: number = 8
) => {
  const total = experience.length;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Активност")
    .addFields(
      await Promise.all(
        experience
          .slice(perPage * page, perPage * (page + 1))
          .map(async (exp, index) => ({
            name: "\u200B",
            value: `${perPage * page + index + 1}. ${await getUsername(
              exp.userId
            )} (${userMention(exp.userId)}): Ниво: ${exp.level} | Поени: ${
              exp.experience
            }`,
          }))
      )
    )
    .setFooter({
      text: `Страна: ${page + 1} / ${Math.max(
        1,
        Math.ceil(total / perPage)
      )}  •  Членови: ${total} / ${all ?? "-"}`,
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
        .setLabel("Линк")
        .setStyle(ButtonStyle.Link)
    ),
  ];
};

export const getListQuestionsEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Прашања")
    .setDescription(
      `Ова се сите достапни прашања. Користете ${commandMention(
        "faq"
      )} за да ги добиете одговорите.\n\n${(await getQuestions())
        .map(
          (question, index) =>
            `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
              question.name
            }`
        )
        .join("\n")}`
    )
    .setTimestamp();
};

export const getListLinksEmbed = async () => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Линкови")
    .setDescription(
      `Ова се сите достапни линкови. Користете ${commandMention(
        "link"
      )} за да ги добиете линковите.\n\n${(await getLinks())
        .map(
          (link, index) =>
            `${inlineCode((index + 1).toString().padStart(2, "0"))} [${
              link.name
            }](${link.url})`
        )
        .join("\n")}`
    )
    .setTimestamp();
};

// Help

export const getHelpFirstPageEmbed = async (
  member: GuildMember | null,
  commandsPerPage: number = 8
) => {
  const totalCommands = getCommandsWithPermission(member).length;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Команди")
    .setDescription(
      "Ова се сите достапни команди за вас. Командите може да ги повикате во овој сервер, или во приватна порака."
    )
    .addFields(
      ...Object.entries(commandDescriptions)
        .filter((command) => hasCommandPermission(member, command[0]))
        .slice(0, commandsPerPage)
        .map(([command, description]) => ({
          name: commandMention(command),
          value: description,
        }))
    )
    .setFooter({
      text: `Страна: 1 / ${Math.max(
        1,
        Math.ceil(totalCommands / commandsPerPage)
      )}  •  Команди: ${totalCommands}`,
    })
    .setTimestamp();
};

export const getHelpNextPageEmbed = async (
  member: GuildMember | null,
  page: number,
  commandsPerPage: number = 8
) => {
  const totalCommands = getCommandsWithPermission(member).length;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Команди")
    .setDescription(
      "Ова се сите достапни команди за вас. Командите може да ги извршите во овој сервер, или во приватна порака."
    )
    .addFields(
      ...Object.entries(commandDescriptions)
        .filter((command) => hasCommandPermission(member, command[0]))
        .slice(commandsPerPage * page, commandsPerPage * (page + 1))
        .map(([command, description]) => ({
          name: commandMention(command),
          value: description,
        }))
    )
    .setFooter({
      text: `Страна: ${page + 1} / ${Math.max(
        1,
        Math.ceil(totalCommands / commandsPerPage)
      )}  •  Команди: ${totalCommands}`,
    })
    .setTimestamp();
};

// Polls

export const getPollEmbed = async (poll: PollWithOptions) => {
  const votes = (await getPollVotesByPollId(poll.id))?.length ?? 0;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setAuthor(poll.done ? { name: "ГЛАСАЊЕТО Е ЗАВРШЕНО" } : null)
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
                Math.max(...poll.options.map((opt) => opt.name.length))
              )} - [${bar}] - ${optionVotes} [${
                votes > 0 ? fraction.toFixed(2).padStart(5, "0") : "00"
              }%]`;
            })
          )
        ).join("\n")
      )}${
        poll.done
          ? `\nРезултат: ${inlineCode(
              poll.decision ??
                (await getMostPopularOptionByPollId(poll.id))?.name ??
                "-"
            )}\n`
          : ""
      }`
    )
    .setFooter({ text: `Анкета: ${poll.id}` })
    .setTimestamp();
};

export const getPollComponents = (poll: PollWithOptions) => {
  const components = [];
  const firstRow = new ActionRowBuilder<ButtonBuilder>();
  const firstButtons = [];
  const highestIndex = Math.min(poll.options.length, 4);

  const infoButton = new ButtonBuilder()
    .setCustomId(`poll:${poll.id}:info`)
    .setLabel("Информации")
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
  const turnout = `(${((votes / voters.length) * 100).toFixed(2)}%)`;
  const threshold = Math.ceil(poll.threshold * voters.length);

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(poll.title)
    .addFields(
      {
        inline: true,
        name: "Повеќекратна?",
        value: poll.multiple ? "Да" : "Не",
      },
      {
        inline: true,
        name: "Анонимна?",
        value: poll.anonymous ? "Да" : "Не",
      },
      {
        inline: true,
        name: "Отворена?",
        value: poll.open ? "Да" : "Не",
      },
      {
        inline: true,
        name: "Автор",
        value: userMention(poll.userId),
      },
      {
        inline: true,
        name: "Гласови",
        value: `${votes} ${poll.roles.length > 0 ? turnout : ""}`,
      },
      {
        inline: true,
        name: "Право на глас",
        value:
          poll.roles.length === 0
            ? "Сите"
            : (
                await getMembersWithRoles(guild, ...poll.roles)
              ).length.toString(),
      },
      {
        inline: true,
        name: "Потребно мнозинство",
        value: `${poll.threshold * 100}% (${
          voters.length % 2 === 0 ? threshold + 1 : threshold
        })`,
      },
      {
        inline: true,
        name: "Улоги",
        value:
          poll.roles.length > 0
            ? poll.roles.map((role) => roleMention(role)).join(", ")
            : "Нема",
      },
      {
        inline: true,
        name: "\u200B",
        value: "\u200B",
      }
    )
    .setFooter({ text: `Анкета: ${poll.id}` })
    .setTimestamp();
};

export const getPollStatsEmbed = async (poll: PollWithOptions) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(poll.title)
    .setDescription(`Гласови: ${(await getPollVotesByPollId(poll.id))?.length}`)
    .addFields(
      {
        inline: true,
        name: "Опции",
        value: (
          await Promise.all(
            poll.options.map(
              async (option, index) =>
                `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                  option.name
                }`
            )
          )
        ).join("\n"),
      },
      {
        inline: true,
        name: "Гласови",
        value: (
          await Promise.all(
            poll.options.map(
              async (option, index) =>
                `${inlineCode((index + 1).toString().padStart(2, "0"))} ${
                  (await getPollVotesByOptionId(option.id))?.length ?? 0
                }`
            )
          )
        ).join("\n"),
      }
    )
    .setFooter({ text: `Анкета: ${poll.id}` })
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

export const getPollStatsButtonEmbed = async (
  id: string,
  option: string,
  votes: PollVote[]
) => {
  const users = votes.map(async (vote) => await getUsername(vote.userId));

  return votes.length > 0
    ? new EmbedBuilder()
        .setColor(await getConfigProperty("color"))
        .setTitle("Резултати од анкета")
        .setDescription(
          `Гласачи за ${inlineCode(option)}:\n${codeBlock(users.join("\n"))}`
        )
        .setTimestamp()
        .setFooter({ text: `Анкета: ${id}` })
    : new EmbedBuilder()
        .setColor(await getConfigProperty("color"))
        .setTitle("Резултати од анкета")
        .setDescription(`Никој не гласал за ${inlineCode(option)}`)
        .setTimestamp()
        .setFooter({ text: `Анкета: ${id}` });
};

export const getPollListFirstPageEmbed = async (
  polls: Poll[],
  all: boolean = false,
  pollsPerPage: number = 8
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Анкети")
    .setDescription(`Ова се сите ${all ? "" : "активни"} анкети.`)
    .addFields(
      ...polls.slice(0, pollsPerPage).map((poll) => ({
        name: all && poll.done ? `${poll.title} (затворена)` : poll.title,
        value: poll.id,
      }))
    )
    .setFooter({
      text: `Страна: 1 / ${Math.max(
        1,
        Math.ceil(polls.length / pollsPerPage)
      )}  •  Анкети: ${polls.length}`,
    })
    .setTimestamp();
};

export const getPollListNextPageEmbed = async (
  polls: Poll[],
  page: number,
  all: boolean = false,
  pollsPerPage: number = 8
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Анкети")
    .setDescription(`Ова се сите ${all ? "" : "активни"} анкети.`)
    .addFields(
      ...polls
        .slice(pollsPerPage * page, pollsPerPage * (page + 1))
        .map((poll) => ({
          name: all && poll.done ? `${poll.title} (затворена)` : poll.title,
          value: poll.id,
        }))
    )
    .setFooter({
      text: `Страна: ${page + 1} / ${Math.max(
        1,
        Math.ceil(polls.length / pollsPerPage)
      )}  •  Анкети: ${polls.length}`,
    })
    .setTimestamp();
};

export const getVipPollListFirstPageEmbed = async (
  polls: VipPoll[],
  pollsPerPage: number = 8
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Анкети")
    .setDescription("Ова се сите ВИП анкети.")
    .addFields(
      ...(await Promise.all(
        polls.slice(0, pollsPerPage).map(async (poll) => ({
          name: `${poll.type} (${await getUsername(poll.userId)})`,
          value: poll.id,
        }))
      ))
    )
    .setFooter({
      text: `Страна: 1 / ${Math.max(
        1,
        Math.ceil(polls.length / pollsPerPage)
      )}  •  Анкети: ${polls.length}`,
    })
    .setTimestamp();
};

export const getVipPollListNextPageEmbed = async (
  polls: VipPoll[],
  page: number,
  pollsPerPage: number = 8
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle("Анкети")
    .setDescription("Ова се сите ВИП анкети.")
    .addFields(
      ...(await Promise.all(
        polls
          .slice(pollsPerPage * page, pollsPerPage * (page + 1))
          .map(async (poll) => ({
            name: `${poll.type} (${await getUsername(poll.userId)})`,
            value: poll.id,
          }))
      ))
    )
    .setFooter({
      text: `Страна: ${page + 1} / ${Math.max(
        1,
        Math.ceil(polls.length / pollsPerPage)
      )}  •  Анкети: ${polls.length}`,
    })
    .setTimestamp();
};

// Pagination

export const getPaginationComponents = (
  name: string,
  position: "end" | "middle" | "none" | "start" = "none"
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
        .setDisabled(true)
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
        .setStyle(ButtonStyle.Primary)
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
        .setStyle(ButtonStyle.Primary)
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
        .setDisabled(true)
    );
  }
};

// Logs

export const getChatInputCommandEmbed = async (
  interaction: ChatInputCommandInteraction
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle("Chat Input Command")
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        inline: true,
        name: "Author",
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: "Channel",
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: "Command",
        value: inlineCode(
          interaction.toString().length > 300
            ? interaction.toString().slice(0, 300)
            : interaction.toString()
        ),
      }
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
};

export const getUserContextMenuCommandEmbed = async (
  interaction: UserContextMenuCommandInteraction
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle("User Context Menu Command")
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        name: "Author",
        value: userMention(interaction.user.id),
      },
      {
        name: "Channel",
        value: getChannel(interaction),
      },
      {
        name: "Command",
        value: inlineCode(interaction.commandName),
      },
      {
        name: "Target",
        value: userMention(interaction.targetUser.id),
      }
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
};

export const getButtonEmbed = (
  interaction: ButtonInteraction,
  command: string = "unknown",
  args: string[] = []
) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle("Button")
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: "Author",
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: "Channel",
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: "Command",
        value: getButtonCommand(command),
      },
      {
        inline: true,
        ...getButtonInfo(interaction, command, args),
      }
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
};

export const getAutocompleteEmbed = (interaction: AutocompleteInteraction) => {
  const focused = interaction.options.getFocused(true);

  return new EmbedBuilder()
    .setColor(color)
    .setTitle("Autocomplete")
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: "Author",
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: "Channel",
        value: getChannel(interaction),
      },
      {
        inline: true,
        name: "Option",
        value: inlineCode(focused.name),
      },
      {
        inline: true,
        name: "Value",
        value: focused.value === "" ? "Empty" : inlineCode(focused.value),
      }
    )
    .setFooter({ text: interaction.id })
    .setTimestamp();
};
