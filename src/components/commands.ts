import {
  linkProfessors,
  transformCoursePrerequisites,
} from "@app/components/utils.js";
import { type Classroom } from "@app/types/Classroom.js";
import { type CourseInformation } from "@app/types/CourseInformation.js";
import { type CourseParticipants } from "@app/types/CourseParticipants.js";
import { type CoursePrerequisites } from "@app/types/CoursePrerequisites.js";
import { type CourseStaff } from "@app/types/CourseStaff.js";
import { type ProgramName } from "@app/types/ProgramName.js";
import { type QuestionWithLinks } from "@app/types/QuestionWithLinks.js";
import { type Staff } from "@app/types/Staff.js";
import { client } from "@app/utils/client.js";
import { commandMention } from "@app/utils/commands.js";
import {
  getConfigProperty,
  getFromRoleConfig,
  getInformation,
  getParticipants,
  getPrerequisites,
  getProfessors,
  getRoleProperty,
} from "@app/utils/config.js";
import { getUsername } from "@app/utils/members.js";
import { getCommandsWithPermission } from "@app/utils/permissions.js";
import { getMembersWithAndWithoutRoles, getRole } from "@app/utils/roles.js";
import {
  aboutString,
  botName,
  commandDescriptions,
  embedMessageFunctions,
  embedMessages,
  paginationStringFunctions,
  programMapping,
  shortStrings,
} from "@app/utils/strings.js";
import { type Experience, type Link, type Question } from "@prisma/client";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type GuildMember,
  inlineCode,
  roleMention,
  type User,
  userMention,
} from "discord.js";

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

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setAuthor({
      iconURL: user.displayAvatarURL(),
      name: user.tag,
    })
    .setTitle(shortStrings.activity)
    .addFields(
      {
        inline: true,
        name: shortStrings.level,
        value: experience.level.toString(),
      },
      {
        inline: true,
        name: shortStrings.points,
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
