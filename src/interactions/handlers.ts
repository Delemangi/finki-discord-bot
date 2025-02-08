import {
  getAutocompleteEmbed,
  getButtonEmbed,
  getChatInputCommandEmbed,
  getMessageContextMenuCommandEmbed,
  getUserContextMenuCommandEmbed,
} from '../components/logs.js';
import { Channel } from '../lib/schemas/Channel.js';
import { logger } from '../logger.js';
import { commandErrors } from '../translations/commands.js';
import { logErrorFunctions, logShortStrings } from '../translations/logs.js';
import { deleteResponse, logEmbed } from '../utils/channels.js';
import {
  getCommand,
  isContextMenuCommand,
  isSlashCommand,
} from '../utils/commands.js';
import { getMemberFromGuild } from '../utils/guild.js';
import { hasCommandPermission } from '../utils/permissions.js';
import {
  handleClassroomAutocomplete,
  handleCompanyAutocomplete,
  handleCourseAutocomplete,
  handleCourseRoleAutocomplete,
  handleLinkAutocomplete,
  handleProfessorAutocomplete,
  handleQuestionAutocomplete,
  handleRuleAutocomplete,
  handleSessionAutocomplete,
} from './autocomplete.js';
import {
  handleAddCoursesButton,
  handleColorButton,
  handleCourseButton,
  handleIrregularsButton,
  handleNotificationButton,
  handleProgramButton,
  handleReminderDeleteButton,
  handleRemoveCoursesButton,
  handleTicketCloseButton,
  handleTicketCreateButton,
  handleVipButton,
  handleYearButton,
} from './button.js';
import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

const ignoredButtons = ['help', 'polls', 'exp'];

export const handleChatInputCommand = async (
  interaction: ChatInputCommandInteraction,
) => {
  try {
    await interaction.deferReply();
  } catch (error) {
    logger.error(
      logErrorFunctions.chatInputInteractionDeferError(interaction, error),
    );
    await interaction.reply(commandErrors.commandError);

    return;
  }

  const command = await getCommand(interaction.commandName);

  logger.info(
    `${logShortStrings.chat} ${interaction.user.tag}: ${interaction} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await logEmbed(
    await getChatInputCommandEmbed(interaction),
    interaction,
    Channel.Logs,
  );

  if (command === undefined || !isSlashCommand(command)) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));
    await interaction.editReply(commandErrors.commandNotFound);

    return;
  }

  const member = await getMemberFromGuild(interaction.user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.commandNoPermission);

    return;
  }

  const fullCommand = (
    interaction.commandName +
    ' ' +
    (interaction.options.getSubcommand(false) ?? '')
  ).trim();

  if (!(await hasCommandPermission(member, fullCommand))) {
    await interaction.editReply(commandErrors.commandNoPermission);

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      logErrorFunctions.chatInputInteractionError(interaction, error),
    );
  }
};

export const handleUserContextMenuCommand = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  try {
    await interaction.deferReply();
  } catch (error) {
    logger.error(
      logErrorFunctions.userContextMenuInteractionDeferError(
        interaction,
        error,
      ),
    );
    await interaction.reply(commandErrors.commandError);

    return;
  }

  const command = await getCommand(interaction.commandName);

  logger.info(
    `${logShortStrings.user} ${interaction.user.tag}: ${
      interaction.commandName
    } [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await logEmbed(
    await getUserContextMenuCommandEmbed(interaction),
    interaction,
    Channel.Logs,
  );

  if (command === undefined || !isContextMenuCommand(command)) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));

    return;
  }

  const member = await getMemberFromGuild(interaction.user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.commandNoPermission);

    return;
  }

  if (!(await hasCommandPermission(member, interaction.commandName))) {
    await interaction.editReply(commandErrors.commandNoPermission);

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      logErrorFunctions.userContextMenuInteractionError(interaction, error),
    );
  }
};

export const handleMessageContextMenuCommand = async (
  interaction: MessageContextMenuCommandInteraction,
) => {
  try {
    await interaction.deferReply();
  } catch (error) {
    logger.error(
      logErrorFunctions.messageContextMenuInteractionDeferError(
        interaction,
        error,
      ),
    );
    await interaction.reply(commandErrors.commandError);

    return;
  }

  const command = await getCommand(interaction.commandName);

  logger.info(
    `${logShortStrings.message} ${interaction.user.tag}: ${
      interaction.commandName
    } [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await logEmbed(
    await getMessageContextMenuCommandEmbed(interaction),
    interaction,
    Channel.Logs,
  );

  if (command === undefined || !isContextMenuCommand(command)) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));

    return;
  }

  const member = await getMemberFromGuild(interaction.user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.commandNoPermission);

    return;
  }

  if (!(await hasCommandPermission(member, interaction.commandName))) {
    await interaction.editReply(commandErrors.commandNoPermission);

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      logErrorFunctions.messageContextMenuInteractionError(interaction, error),
    );
  }
};

const buttonInteractionHandlers = {
  addCourses: handleAddCoursesButton,
  color: handleColorButton,
  course: handleCourseButton,
  irregulars: handleIrregularsButton,
  notification: handleNotificationButton,
  program: handleProgramButton,
  reminderDelete: handleReminderDeleteButton,
  removeCourses: handleRemoveCoursesButton,
  ticketClose: handleTicketCloseButton,
  ticketCreate: handleTicketCreateButton,
  vip: handleVipButton,
  year: handleYearButton,
};

const ephemeralResponseButtons = ['addCourses', 'removeCourses'];

export const handleButton = async (interaction: ButtonInteraction) => {
  const [command, ...args] = interaction.customId.split(':');

  logger.info(
    `${logShortStrings.button} ${interaction.user.tag}: ${
      interaction.customId
    } [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await logEmbed(
    getButtonEmbed(interaction, command, args),
    interaction,
    Channel.Logs,
  );

  if (command === undefined) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));

    return;
  }

  if (ephemeralResponseButtons.includes(command)) {
    try {
      const mess = await interaction.deferReply({
        ephemeral: true,
      });
      void deleteResponse(mess, 10_000);
    } catch (error) {
      logger.error(
        logErrorFunctions.buttonInteractionDeferError(interaction, error),
      );
    }
  }

  if (Object.keys(buttonInteractionHandlers).includes(command)) {
    await buttonInteractionHandlers[
      command as keyof typeof buttonInteractionHandlers
    ](interaction, args);
  } else if (ignoredButtons.includes(command)) {
    // Do nothing
  } else {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));
  }
};

const autocompleteInteractionHandlers = {
  classroom: handleClassroomAutocomplete,
  company: handleCompanyAutocomplete,
  course: handleCourseAutocomplete,
  courserole: handleCourseRoleAutocomplete,
  link: handleLinkAutocomplete,
  professor: handleProfessorAutocomplete,
  question: handleQuestionAutocomplete,
  rule: handleRuleAutocomplete,
  session: handleSessionAutocomplete,
};

export const handleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const option = interaction.options.getFocused(true);

  logger.info(
    `${logShortStrings.auto} ${interaction.user.tag}: ${option.name} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await logEmbed(getAutocompleteEmbed(interaction), interaction, Channel.Logs);

  if (Object.keys(autocompleteInteractionHandlers).includes(option.name)) {
    await autocompleteInteractionHandlers[
      option.name as keyof typeof autocompleteInteractionHandlers
    ](interaction);
  } else {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));
  }
};
