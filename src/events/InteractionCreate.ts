import {
  handleAutocomplete,
  handleButton,
  handleChatInputCommand,
  handleUserContextMenuCommand,
} from '../utils/interactions.js';
import { logger } from '../utils/logger.js';
import { type ClientEvents, Events } from 'discord.js';

export const name = Events.InteractionCreate;

export const execute = async (...args: ClientEvents[typeof name]) => {
  if (args[0].isChatInputCommand()) {
    await handleChatInputCommand(args[0]);
  } else if (args[0].isButton()) {
    await handleButton(args[0]);
  } else if (args[0].isUserContextMenuCommand()) {
    await handleUserContextMenuCommand(args[0]);
  } else if (args[0].isAutocomplete()) {
    await handleAutocomplete(args[0]);
  } else {
    logger.warn(`Received unknown interaction by ${args[0].user.id}`);
  }
};
