import { getCompanies } from "../data/Company.js";
import { getInfoMessages } from "../data/InfoMessage.js";
import { sendEmbed } from "../utils/channels.js";
import { getCommands } from "../utils/commands.js";
import {
  getColorsComponents,
  getColorsEmbed,
  getCoursesAddComponents,
  getCoursesAddEmbed,
  getCoursesComponents,
  getCoursesEmbed,
  getCoursesRemoveComponents,
  getCoursesRemoveEmbed,
  getNotificationsComponents,
  getNotificationsEmbed,
  getProgramsComponents,
  getProgramsEmbed,
  getRulesEmbed,
  getVipRequestComponents,
  getVipRequestEmbed,
  getYearsComponents,
  getYearsEmbed,
} from "../utils/components.js";
import {
  getApplicationId,
  getCourses,
  getFromRoleConfig,
  getToken,
} from "../utils/config.js";
import { logger } from "../utils/logger.js";
import { commandDescriptions } from "../utils/strings.js";
import { InfoMessageType } from "@prisma/client";
import {
  type Channel,
  ChannelType,
  type ChatInputCommandInteraction,
  type ForumChannel,
  type GuildBasedChannel,
  type GuildTextBasedChannel,
  inlineCode,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

const name = "script";
const permission = PermissionFlagsBits.Administrator;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Script")
  .addSubcommand((command) =>
    command
      .setName("courses")
      .setDescription(commandDescriptions["script courses"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("rolesets")
          .setDescription("Сетови на улоги")
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("colors")
      .setDescription(commandDescriptions["script colors"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("image").setDescription("Слика").setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("notifications")
      .setDescription(commandDescriptions["script notifications"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("programs")
      .setDescription(commandDescriptions["script programs"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("years")
      .setDescription(commandDescriptions["script years"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("rules")
      .setDescription(commandDescriptions["script rules"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("register")
      .setDescription(commandDescriptions["script register"])
  )
  .addSubcommand((command) =>
    command
      .setName("vip")
      .setDescription(commandDescriptions["script vip"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("info")
      .setDescription(commandDescriptions["script info"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("coursesforum")
      .setDescription("Courses forum")
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("companiesforum")
      .setDescription("Companies forum")
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true)
      )
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(permission);

const handleScriptCourses = async (
  interaction: ChatInputCommandInteraction
) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const newlines = interaction.options.getNumber("newlines") ?? 0;
  const roleSets = interaction.options.getString("rolesets")?.split(",") ?? [];

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply("Само текст канали се дозволени.");
  }

  for (const roleSet of roleSets.length === 0 ? "12345678" : roleSets) {
    const roles = getFromRoleConfig("course")[roleSet];

    if (roles === undefined) {
      await interaction.editReply("Невалиден сет на улоги.");
      return;
    }

    const embed = await getCoursesEmbed(roleSet, roles);
    const components = getCoursesComponents(roles);
    try {
      await sendEmbed(
        channel as GuildTextBasedChannel,
        embed,
        components,
        Number(newlines)
      );
      await interaction.editReply("Успешно испратено.");
    } catch (error) {
      await interaction.editReply("Испраќањето беше неуспешно.");
      logger.error(`Couldn't send embed\n${error}`);
      return;
    }
  }

  const addEmbed = await getCoursesAddEmbed();
  const addComponents = getCoursesAddComponents(
    roleSets.length === 0 ? Array.from("12345678") : roleSets
  );
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      addEmbed,
      addComponents,
      Number(newlines)
    );
    await interaction.editReply("Успешно испратено.");
  } catch (error) {
    await interaction.editReply("Испраќањето беше неуспешно.");
    logger.error(`Couldn't send embed\n${error}`);
    return;
  }

  const removeEmbed = await getCoursesRemoveEmbed();
  const removeComponents = getCoursesRemoveComponents(
    roleSets.length === 0 ? Array.from("12345678") : roleSets
  );
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      removeEmbed,
      removeComponents,
      Number(newlines)
    );
    await interaction.editReply("Успешно испратено.");
  } catch (error) {
    await interaction.editReply("Испраќањето беше неуспешно.");
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptColors = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const image = interaction.options.getString("image", true);
  const newlines = interaction.options.getNumber("newlines") ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply("Само текст канали се дозволени.");
  }

  const embed = await getColorsEmbed(image);
  const components = getColorsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines)
    );
    await interaction.editReply("Успешно испратено.");
  } catch (error) {
    await interaction.editReply("Испраќањето беше неуспешно.");
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptNotifications = async (
  interaction: ChatInputCommandInteraction
) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const newlines = interaction.options.getNumber("newlines") ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply("Само текст канали се дозволени.");
  }

  const embed = await getNotificationsEmbed();
  const components = getNotificationsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines)
    );
    await interaction.editReply("Успешно испратено.");
  } catch (error) {
    await interaction.editReply("Испраќањето беше неуспешно.");
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptPrograms = async (
  interaction: ChatInputCommandInteraction
) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const newlines = interaction.options.getNumber("newlines") ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply("Само текст канали се дозволени.");
  }

  const embed = await getProgramsEmbed();
  const components = getProgramsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines)
    );
    await interaction.editReply("Успешно испратено.");
  } catch (error) {
    await interaction.editReply("Испраќањето беше неуспешно.");
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptYears = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const newlines = interaction.options.getNumber("newlines") ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply("Само текст канали се дозволени.");
  }

  const embed = await getYearsEmbed();
  const components = getYearsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      [components],
      Number(newlines)
    );
    await interaction.editReply("Успешно испратено.");
  } catch (error) {
    await interaction.editReply("Испраќањето беше неуспешно.");
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptRegister = async (
  interaction: ChatInputCommandInteraction
) => {
  const rest = new REST().setToken(getToken());
  const commandsToRegister = [];

  for (const [, command] of await getCommands()) {
    commandsToRegister.push(command.data.toJSON());
  }

  try {
    await rest.put(Routes.applicationCommands(getApplicationId()), {
      body: commandsToRegister,
    });
    await interaction.editReply("Командите се успешно синхронизирани.");
  } catch (error) {
    await interaction.editReply("Синхронизацијата беше неуспешна.");
    logger.error(`Couldn't register commands\n${error}`);
  }
};

const handleScriptRules = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply("Само текст канали се дозволени.");
  }

  const embed = await getRulesEmbed();
  try {
    await (channel as GuildTextBasedChannel).send({
      embeds: [embed],
    });
    await interaction.editReply("Успешно испратено.");
  } catch (error) {
    await interaction.editReply("Испраќањето беше неуспешно.");
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptVip = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel(
    "channel",
    true
  ) as GuildBasedChannel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply("Само текст канали се дозволени.");
  }

  const embed = await getVipRequestEmbed();
  const components = getVipRequestComponents();
  try {
    await (channel as GuildTextBasedChannel).send({
      components,
      embeds: [embed],
    });
    await interaction.editReply("Успешно испратено.");
  } catch (error) {
    await interaction.editReply("Испраќањето беше неуспешно.");
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptInfo = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel(
    "channel",
    true
  ) as GuildBasedChannel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply("Само текст канали се дозволени.");
  }

  const infoMessages = await getInfoMessages();

  for (const message of infoMessages) {
    if (message.type === InfoMessageType.IMAGE) {
      try {
        await (channel as GuildTextBasedChannel).send({
          files: [message.content],
        });
      } catch (error) {
        await interaction.editReply("Испраќањето беше неуспешно.");
        logger.error(`Couldn't send image\n${error}`);
        return;
      }
    } else if (message.type === InfoMessageType.TEXT) {
      try {
        await (channel as GuildTextBasedChannel).send({
          allowedMentions: { parse: [] },
          content: message.content.replaceAll("\\n", "\n"),
        });
      } catch (error) {
        await interaction.editReply("Испраќањето беше неуспешно.");
        logger.error(`Couldn't send text\n${error}`);
        return;
      }
    }
  }

  await interaction.editReply("Успешно испратено.");
};

const handleCoursesForum = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel(
    "channel",
    true
  ) as GuildBasedChannel;

  if (channel.type !== ChannelType.GuildForum) {
    await interaction.editReply("Само форуми се дозволени.");
  }

  for (const course of getCourses()) {
    await (channel as ForumChannel).threads.create({
      message: {
        content: `Овој канал е за предметот ${inlineCode(course)}.`,
      },
      name: course,
    });
  }
};

const handleCompaniesForum = async (
  interaction: ChatInputCommandInteraction
) => {
  const channel = interaction.options.getChannel(
    "channel",
    true
  ) as GuildBasedChannel;

  if (channel.type !== ChannelType.GuildForum) {
    await interaction.editReply("Само форуми се дозволени.");
  }

  for (const company of await getCompanies()) {
    await (channel as ForumChannel).threads.create({
      message: {
        content: `Овој канал е за компанијата ${inlineCode(company.name)}.`,
      },
      name: company.name,
    });
  }
};

const listHandlers = {
  colors: handleScriptColors,
  companiesforum: handleCompaniesForum,
  courses: handleScriptCourses,
  coursesforum: handleCoursesForum,
  info: handleScriptInfo,
  notifications: handleScriptNotifications,
  programs: handleScriptPrograms,
  register: handleScriptRegister,
  rules: handleScriptRules,
  vip: handleScriptVip,
  years: handleScriptYears,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(listHandlers).includes(subcommand)) {
    await listHandlers[subcommand as keyof typeof listHandlers](interaction);
  }
};
