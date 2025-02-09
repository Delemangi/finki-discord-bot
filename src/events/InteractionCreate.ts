import { type ClientEvents, Events } from 'discord.js';

import {
  handleAutocomplete,
  handleButton,
  handleChatInputCommand,
  handleMessageContextMenuCommand,
  handleUserContextMenuCommand,
} from '../interactions/handlers.js';
import { logger } from '../logger.js';
import { logErrorFunctions } from '../translations/logs.js';

export const name = Events.InteractionCreate;

export const execute = async (...[interaction]: ClientEvents[typeof name]) => {
  if (interaction.isChatInputCommand()) {
    await handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    await handleButton(interaction);
  } else if (interaction.isUserContextMenuCommand()) {
    await handleUserContextMenuCommand(interaction);
  } else if (interaction.isMessageContextMenuCommand()) {
    await handleMessageContextMenuCommand(interaction);
  } else if (interaction.isAutocomplete()) {
    await handleAutocomplete(interaction);
  } else {
    logger.warn(logErrorFunctions.unknownInteractionError(interaction.user.id));
  }
};
