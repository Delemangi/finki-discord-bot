import { InfoMessageType } from '@prisma/client';
import {
  type Channel,
  ChannelType,
  type ChatInputCommandInteraction,
  type GuildBasedChannel,
  type GuildTextBasedChannel,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';

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
  getSpecialRequestComponents,
  getSpecialRequestEmbed,
  getYearsComponents,
  getYearsEmbed,
} from '../components/scripts.js';
import { getTicketCreateComponents } from '../components/tickets.js';
import { getApplicationId, getToken } from '../configuration/environment.js';
import { getCourses, getFromRoleConfig } from '../configuration/files.js';
import { getTicketingProperty } from '../configuration/main.js';
import { getCompanies } from '../data/Company.js';
import { getInfoMessages } from '../data/InfoMessage.js';
import { getRules } from '../data/Rule.js';
import { logger } from '../logger.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponses,
} from '../translations/commands.js';
import { logErrorFunctions } from '../translations/logs.js';
import { threadMessageFunctions } from '../translations/threads.js';
import { ticketMessages } from '../translations/tickets.js';
import { sendEmbed } from '../utils/channels.js';
import { getCommands } from '../utils/commands.js';

const name = 'script';
const permission = PermissionFlagsBits.Administrator;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Script')
  .addSubcommand((command) =>
    command
      .setName('courses')
      .setDescription(commandDescriptions['script courses'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName('rolesets')
          .setDescription('Сетови на улоги')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('colors')
      .setDescription(commandDescriptions['script colors'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('image').setDescription('Слика').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('notifications')
      .setDescription(commandDescriptions['script notifications'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('programs')
      .setDescription(commandDescriptions['script programs'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('years')
      .setDescription(commandDescriptions['script years'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('rules')
      .setDescription(commandDescriptions['script rules'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('register')
      .setDescription(commandDescriptions['script register']),
  )
  .addSubcommand((command) =>
    command
      .setName('special')
      .setDescription(commandDescriptions['script special'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('info')
      .setDescription(commandDescriptions['script info'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('coursesforum')
      .setDescription('Courses forum')
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('companiesforum')
      .setDescription('Companies forum')
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('tickets')
      .setDescription('Register commands')
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(permission);

const handleScriptCourses = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const newlines = interaction.options.getNumber('newlines') ?? 0;
  const roleSets = interaction.options.getString('rolesets')?.split(',') ?? [];

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  for (const roleSet of roleSets.length === 0 ? '12345678' : roleSets) {
    const courses = getFromRoleConfig('course');

    if (courses === undefined) {
      await interaction.editReply(commandErrors.coursesNotFound);

      return;
    }

    const roles = courses[roleSet];

    if (roles === undefined) {
      await interaction.editReply(commandErrors.invalidRoles);

      return;
    }

    const embed = getCoursesEmbed(roleSet, roles);
    const components = getCoursesComponents(roles);
    try {
      await sendEmbed(channel, embed, components, Number(newlines));
      await interaction.editReply(commandResponses.scriptExecuted);
    } catch (error) {
      await interaction.editReply(commandErrors.scriptNotExecuted);
      logger.error(logErrorFunctions.scriptExecutionError(error));

      return;
    }
  }

  const addEmbed = getCoursesAddEmbed();
  const addComponents = getCoursesAddComponents(
    roleSets.length === 0 ? Array.from('12345678') : roleSets,
  );
  try {
    await sendEmbed(channel, addEmbed, addComponents, Number(newlines));
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));

    return;
  }

  const removeEmbed = getCoursesRemoveEmbed();
  const removeComponents = getCoursesRemoveComponents(
    roleSets.length === 0 ? Array.from('12345678') : roleSets,
  );
  try {
    await sendEmbed(channel, removeEmbed, removeComponents, Number(newlines));
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptColors = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const image = interaction.options.getString('image', true);
  const newlines = interaction.options.getNumber('newlines') ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const embed = getColorsEmbed(image);
  const components = getColorsComponents();
  try {
    await sendEmbed(channel, embed, components, Number(newlines));
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptNotifications = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const newlines = interaction.options.getNumber('newlines') ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const embed = getNotificationsEmbed();
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
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const newlines = interaction.options.getNumber('newlines') ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const embed = getProgramsEmbed();
  const components = getProgramsComponents();
  try {
    await sendEmbed(channel, embed, components, Number(newlines));
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptYears = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const newlines = interaction.options.getNumber('newlines') ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);
  }

  const embed = getYearsEmbed();
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
  const channel = interaction.options.getChannel('channel', true) as Channel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const rules = await getRules();

  if (rules === null) {
    await interaction.editReply(commandErrors.scriptNotExecuted);

    return;
  }

  const embed = getRulesEmbed(rules);
  try {
    await channel.send({
      embeds: [embed],
    });
    await interaction.editReply(commandResponses.scriptExecuted);
  } catch (error) {
    await interaction.editReply(commandErrors.scriptNotExecuted);
    logger.error(logErrorFunctions.scriptExecutionError(error));
  }
};

const handleScriptSpecial = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel(
    'channel',
    true,
  ) as GuildBasedChannel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const embed = getSpecialRequestEmbed();
  const components = getSpecialRequestComponents();
  try {
    await channel.send({
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
    'channel',
    true,
  ) as GuildBasedChannel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const infoMessages = await getInfoMessages();

  if (infoMessages === null) {
    await interaction.editReply(commandErrors.scriptNotExecuted);

    return;
  }

  for (const message of infoMessages) {
    if (message.type === InfoMessageType.IMAGE) {
      try {
        await channel.send({
          files: [message.content],
        });
      } catch (error) {
        await interaction.editReply(commandErrors.scriptNotExecuted);
        logger.error(logErrorFunctions.scriptExecutionError(error));

        return;
      }
    } else {
      try {
        await channel.send({
          allowedMentions: {
            parse: [],
          },
          content: message.content.replaceAll(String.raw`\n`, '\n'),
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

const handleScriptCoursesForum = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel(
    'channel',
    true,
  ) as GuildBasedChannel;

  if (channel.type !== ChannelType.GuildForum) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  for (const course of getCourses()) {
    await channel.threads.create({
      message: {
        content: threadMessageFunctions.courseThreadMessage(course),
      },
      name: course,
    });
  }

  await interaction.editReply(commandResponses.scriptExecuted);
};

const handleScriptCompaniesForum = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel(
    'channel',
    true,
  ) as GuildBasedChannel;

  if (channel.type !== ChannelType.GuildForum) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const companies = await getCompanies();

  if (companies === null) {
    await interaction.editReply(commandErrors.scriptNotExecuted);

    return;
  }

  for (const company of companies) {
    await channel.threads.create({
      message: {
        content: threadMessageFunctions.companyThreadMessage(company.name),
      },
      name: company.name,
    });
  }

  await interaction.editReply(commandResponses.scriptExecuted);
};

const handleScriptTickets = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel(
    'channel',
    true,
  ) as GuildBasedChannel;

  if (channel.type !== ChannelType.GuildText) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const tickets = getTicketingProperty('tickets');

  const components = getTicketCreateComponents(tickets ?? []);

  await channel.send({
    allowedMentions: {
      parse: [],
    },
    components,
    content: ticketMessages.createTicket,
  });

  await interaction.editReply(commandResponses.scriptExecuted);
};

const listHandlers = {
  colors: handleScriptColors,
  companiesforum: handleScriptCompaniesForum,
  courses: handleScriptCourses,
  coursesforum: handleScriptCoursesForum,
  info: handleScriptInfo,
  notifications: handleScriptNotifications,
  programs: handleScriptPrograms,
  register: handleScriptRegister,
  rules: handleScriptRules,
  special: handleScriptSpecial,
  tickets: handleScriptTickets,
  years: handleScriptYears,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand in listHandlers) {
    await listHandlers[subcommand as keyof typeof listHandlers](interaction);
  }
};
