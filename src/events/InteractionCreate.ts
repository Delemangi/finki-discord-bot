import {
  handleAutocomplete,
  handleButton,
  handleChatInputCommand,
  handleUserContextMenuCommand,
} from '../interactions/handlers.js';
import { logErrorFunctions } from '../translations/logs.js';
import { logger } from '../utils/logger.js';
import { type ClientEvents, Events } from 'discord.js';

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
