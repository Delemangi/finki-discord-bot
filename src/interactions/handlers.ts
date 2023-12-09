import {
  getAutocompleteEmbed,
  getButtonEmbed,
  getChatInputCommandEmbed,
  getUserContextMenuCommandEmbed,
} from "../components/logs.js";
import { commandErrors } from "../translations/commands.js";
import { logErrorFunctions, logShortStrings } from "../translations/logs.js";
import { deleteResponse, logEmbed } from "../utils/channels.js";
import { getCommand } from "../utils/commands.js";
import { logger } from "../utils/logger.js";
import { hasCommandPermission } from "../utils/permissions.js";
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
} from "./autocomplete.js";
import {
  handleAddCoursesButton,
  handleColorButton,
  handleCourseButton,
  handleNotificationButton,
  handlePollButton,
  handlePollStatsButton,
  handleProgramButton,
  handleRemoveCoursesButton,
  handleVipButton,
  handleYearButton,
} from "./button.js";
import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type GuildMember,
  type UserContextMenuCommandInteraction,
} from "discord.js";

const ignoredButtons = ["help", "polls", "exp"];

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
    "commands",
  );

  if (command === undefined) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));
    await interaction.editReply(commandErrors.commandNotFound);

    return;
  }

  const fullCommand = (
    interaction.commandName +
    " " +
    (interaction.options.getSubcommand(false) ?? "")
  ).trim();

  if (
    interaction.member === null ||
    !(await hasCommandPermission(
      interaction.member as GuildMember,
      fullCommand,
    ))
  ) {
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
    "commands",
  );

  if (command === undefined) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));

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

const buttonInteractionHandlers = {
  addCourses: handleAddCoursesButton,
  color: handleColorButton,
  course: handleCourseButton,
  notification: handleNotificationButton,
  poll: handlePollButton,
  pollStats: handlePollStatsButton,
  program: handleProgramButton,
  removeCourses: handleRemoveCoursesButton,
  vip: handleVipButton,
  year: handleYearButton,
};

const ephemeralResponseButtons = ["addCourses", "removeCourses"];

export const handleButton = async (interaction: ButtonInteraction) => {
  const [command, ...args] = interaction.customId.split(":");

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
    "commands",
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
  await logEmbed(getAutocompleteEmbed(interaction), interaction, "commands");

  if (Object.keys(autocompleteInteractionHandlers).includes(option.name)) {
    await autocompleteInteractionHandlers[
      option.name as keyof typeof autocompleteInteractionHandlers
    ](interaction);
  } else {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));
  }
};
