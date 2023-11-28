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
} from "@app/components/scripts.js";
import { getCompanies } from "@app/data/Company.js";
import { getInfoMessages } from "@app/data/InfoMessage.js";
import { getRules } from "@app/data/Rule.js";
import { sendEmbed } from "@app/utils/channels.js";
import { getCommands } from "@app/utils/commands.js";
import {
  getApplicationId,
  getCourses,
  getFromRoleConfig,
  getToken,
} from "@app/utils/config.js";
import { logger } from "@app/utils/logger.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponses,
  logErrorFunctions,
  threadMessageFunctions,
} from "@app/utils/strings.js";
import { InfoMessageType } from "@prisma/client";
import {
  type Channel,
  ChannelType,
  type ChatInputCommandInteraction,
  type ForumChannel,
  type GuildBasedChannel,
  type GuildTextBasedChannel,
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
        option.setName("channel").setDescription("Канал").setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("rolesets")
          .setDescription("Сетови на улоги")
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("colors")
      .setDescription(commandDescriptions["script colors"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("image").setDescription("Слика").setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("notifications")
      .setDescription(commandDescriptions["script notifications"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("programs")
      .setDescription(commandDescriptions["script programs"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("years")
      .setDescription(commandDescriptions["script years"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName("newlines")
          .setDescription("Број на празни редови")
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("rules")
      .setDescription(commandDescriptions["script rules"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("register")
      .setDescription(commandDescriptions["script register"]),
  )
  .addSubcommand((command) =>
    command
      .setName("vip")
      .setDescription(commandDescriptions["script vip"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("info")
      .setDescription(commandDescriptions["script info"])
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("coursesforum")
      .setDescription("Courses forum")
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("companiesforum")
      .setDescription("Companies forum")
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Канал").setRequired(true),
      ),
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(permission);

const handleScriptCourses = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const newlines = interaction.options.getNumber("newlines") ?? 0;
  const roleSets = interaction.options.getString("rolesets")?.split(",") ?? [];

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  for (const roleSet of roleSets.length === 0 ? "12345678" : roleSets) {
    const roles = getFromRoleConfig("course")[roleSet];

    if (roles === undefined) {
      await interaction.editReply(commandErrors.invalidRoles);

      return;
    }

    const embed = await getCoursesEmbed(roleSet, roles);
    const components = getCoursesComponents(roles);
    try {
      await sendEmbed(
        channel as GuildTextBasedChannel,
        embed,
        components,
        Number(newlines),
      );
      await interaction.editReply(commandResponses.scriptExecuted);
    } catch (error) {
      await interaction.editReply(commandErrors.scriptNotExecuted);
      logger.error(logErrorFunctions.scriptExecutionError(error));

      return;
    }
  }

  const addEmbed = await getCoursesAddEmbed();
  const addComponents = getCoursesAddComponents(
    roleSets.length === 0 ? Array.from("12345678") : roleSets,
  );
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      addEmbed,
      addComponents,
      Number(newlines),
    );
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));

    return;
  }

  const removeEmbed = await getCoursesRemoveEmbed();
  const removeComponents = getCoursesRemoveComponents(
    roleSets.length === 0 ? Array.from("12345678") : roleSets,
  );
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      removeEmbed,
      removeComponents,
      Number(newlines),
    );
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptColors = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const image = interaction.options.getString("image", true);
  const newlines = interaction.options.getNumber("newlines") ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const embed = await getColorsEmbed(image);
  const components = getColorsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines),
    );
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptNotifications = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const newlines = interaction.options.getNumber("newlines") ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const embed = await getNotificationsEmbed();
  const components = getNotificationsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines),
    );
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptPrograms = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const newlines = interaction.options.getNumber("newlines") ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const embed = await getProgramsEmbed();
  const components = getProgramsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines),
    );
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptYears = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;
  const newlines = interaction.options.getNumber("newlines") ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const embed = await getYearsEmbed();
  const components = getYearsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      [components],
      Number(newlines),
    );
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptRegister = async (
  interaction: ChatInputCommandInteraction,
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
    await interaction.editReply(commandResponses.commandsRegistered);
  } catch (error) {
    await interaction.editReply(commandErrors.commandsNotRegistered);
    logger.error(logErrorFunctions.commandsRegistrationError(error));
  }
};

const handleScriptRules = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel("channel", true) as Channel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const rules = await getRules();

  if (rules === null) {
    await interaction.editReply(commandErrors.scriptNotExecuted);

    return;
  }

  const embed = await getRulesEmbed(rules);
  try {
    await (channel as GuildTextBasedChannel).send({
      embeds: [embed],
    });
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptVip = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel(
    "channel",
    true,
  ) as GuildBasedChannel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const embed = await getVipRequestEmbed();
  const components = getVipRequestComponents();
  try {
    await (channel as GuildTextBasedChannel).send({
      components,
      embeds: [embed],
    });
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptInfo = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel(
    "channel",
    true,
  ) as GuildBasedChannel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const infoMessages = await getInfoMessages();

  if (infoMessages === null) {
    await interaction.editReply(commandErrors.scriptNotExecuted);

    return;
  }

  for (const message of infoMessages) {
    if (message.type === InfoMessageType.IMAGE) {
      try {
        await (channel as GuildTextBasedChannel).send({
          files: [message.content],
        });
      } catch (error) {
        await interaction.editReply(commandErrors.scriptNotExecuted);
        logger.error(logErrorFunctions.scriptExecutionError(error));

        return;
      }
    } else if (message.type === InfoMessageType.TEXT) {
      try {
        await (channel as GuildTextBasedChannel).send({
          allowedMentions: {
            parse: [],
          },
          content: message.content.replaceAll("\\n", "\n"),
        });
      } catch (error) {
        await interaction.editReply(commandErrors.scriptNotExecuted);
        logger.error(logErrorFunctions.scriptExecutionError(error));

        return;
      }
    }
  }

  await interaction.editReply(commandResponses.scriptExecuted);
};

const handleCoursesForum = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel(
    "channel",
    true,
  ) as GuildBasedChannel;

  if (channel.type !== ChannelType.GuildForum) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  for (const course of getCourses()) {
    await (channel as ForumChannel).threads.create({
      message: {
        content: threadMessageFunctions.courseThreadMessage(course),
      },
      name: course,
    });
  }
};

const handleCompaniesForum = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel(
    "channel",
    true,
  ) as GuildBasedChannel;

  if (channel.type !== ChannelType.GuildForum) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const companies = await getCompanies();

  if (companies === null) {
    await interaction.editReply(commandErrors.scriptNotExecuted);

    return;
  }

  for (const company of companies) {
    await (channel as ForumChannel).threads.create({
      message: {
        content: threadMessageFunctions.companyThreadMessage(company.name),
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
