import {
  embedMessageFunctions,
  embedMessages,
} from "../translations/embeds.js";
import { labels } from "../translations/labels.js";
import { vipStrings } from "../translations/vip.js";
import { getConfigProperty, getFromRoleConfig } from "../utils/config.js";
import { type Rule } from "@prisma/client";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  inlineCode,
  italic,
} from "discord.js";

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
    .setTitle(labels.rules)
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
