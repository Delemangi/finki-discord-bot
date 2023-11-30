import { logMessageFunctions } from "../translations/logs.js";
import {
  initializeChannels,
  scheduleVipTemporaryChannel,
} from "../utils/channels.js";
import { client as bot } from "../utils/client.js";
import { logger } from "../utils/logger.js";
import { initializeRoles } from "../utils/roles.js";
import { type ClientEvents, Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export const execute = async (...[client]: ClientEvents[typeof name]) => {
  await initializeChannels();
  await initializeRoles();
  void scheduleVipTemporaryChannel();
  await client.application?.commands.fetch();
  logger.info(logMessageFunctions.loggedIn(bot.user?.tag));
};
