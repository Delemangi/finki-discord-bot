import { logMessageFunctions } from "@app/translations/logs.js";
import {
  initializeChannels,
  scheduleVipTemporaryChannel,
} from "@app/utils/channels.js";
import { client as bot } from "@app/utils/client.js";
import { logger } from "@app/utils/logger.js";
import { initializeRoles } from "@app/utils/roles.js";
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
