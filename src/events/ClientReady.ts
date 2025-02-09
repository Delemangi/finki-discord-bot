import { type ClientEvents, Events } from 'discord.js';

import { client as bot } from '../client.js';
import { Channel } from '../lib/schemas/Channel.js';
import { logger } from '../logger.js';
import { bootMessage, logMessageFunctions } from '../translations/logs.js';
import {
  getChannel,
  initializeChannels,
  resetTemporaryRegularsChannel,
  resetTemporaryVipChannel,
} from '../utils/channels.js';
import { initializePolls } from '../utils/polls/main.js';
import { sendReminders } from '../utils/reminders.js';
import { initializeRoles } from '../utils/roles.js';
import { closeInactiveTickets } from '../utils/tickets.js';

export const name = Events.ClientReady;
export const once = true;

export const execute = async (...[client]: ClientEvents[typeof name]) => {
  // Initialize Discord objects

  await initializeChannels();
  await initializeRoles();
  await initializePolls();
  await client.application.commands.fetch();

  // Cron jobs

  void sendReminders();
  void closeInactiveTickets();
  resetTemporaryVipChannel();
  resetTemporaryRegularsChannel();

  // Done

  logger.info(logMessageFunctions.loggedIn(bot.user?.tag));

  const commandsChannel = getChannel(Channel.Logs);
  await commandsChannel?.send(bootMessage(new Date().toUTCString()));
};
