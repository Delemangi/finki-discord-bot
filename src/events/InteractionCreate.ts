import {
  handleAutocomplete,
  handleButton,
  handleChatInputCommand,
  handleUserContextMenuCommand,
} from "@app/utils/interactions.js";
import { logger } from "@app/utils/logger.js";
import { logErrorFunctions } from "@app/utils/strings.js";
import { type ClientEvents, Events } from "discord.js";

export const name = Events.InteractionCreate;

export const execute = async (...[interaction]: ClientEvents[typeof name]) => {
  if (interaction.isChatInputCommand()) {
    await handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    await handleButton(interaction);
  } else if (interaction.isUserContextMenuCommand()) {
    await handleUserContextMenuCommand(interaction);
  } else if (interaction.isAutocomplete()) {
    await handleAutocomplete(interaction);
  } else {
    logger.warn(logErrorFunctions.unknownInteractionError(interaction.user.id));
  }
};
