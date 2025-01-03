import { bootMessage, logMessageFunctions } from '../translations/logs.js';
import { Channel } from '../types/schemas/Channel.js';
import {
  getChannel,
  initializeChannels,
  resetTemporaryRegularsChannel,
  resetTemporaryVipChannel,
} from '../utils/channels.js';
import { client as bot } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { sendReminders } from '../utils/reminders.js';
import { initializeRoles } from '../utils/roles.js';
import { closeSpecialPolls } from '../utils/special.js';
import { closeInactiveTickets } from '../utils/tickets.js';
import { type ClientEvents, Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export const execute = async (...[client]: ClientEvents[typeof name]) => {
  // Initialize Discord objects

  await initializeChannels();
  await initializeRoles();
  await client.application?.commands.fetch();

  // Cron jobs

  void sendReminders();
  void closeSpecialPolls();
  void closeInactiveTickets();
  void resetTemporaryVipChannel();
  void resetTemporaryRegularsChannel();

  // Done

  logger.info(logMessageFunctions.loggedIn(bot.user?.tag));

  const commandsChannel = getChannel(Channel.Logs);
  commandsChannel?.send(bootMessage());
};
