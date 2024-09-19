import { logMessageFunctions } from '../translations/logs.js';
import { getChannel } from './channels.js';
import { getChannelProperty, getConfigProperty } from './config.js';
import { getGuild } from './guild.js';
import { logger } from './logger.js';
import {
  type AnyThreadChannel,
  ChannelType,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';

export const getActiveTickets = async (
  interaction?: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);
  const ticketsChannel = await getChannelProperty('tickets');

  const threads = guild?.channels.cache.filter(
    (channel): channel is AnyThreadChannel =>
      channel.isThread() &&
      channel.parentId === ticketsChannel &&
      !channel.archived &&
      !channel.locked,
  );

  return threads;
};

export const closeTicket = async (ticketThreadId: string) => {
  const ticketsChannel = getChannel('tickets');

  if (
    ticketsChannel === undefined ||
    ticketsChannel.type !== ChannelType.GuildText
  ) {
    return;
  }

  const ticketChannel = ticketsChannel.threads.cache.get(ticketThreadId);

  if (ticketChannel === undefined) {
    return;
  }

  await ticketChannel.setLocked(true);
  await ticketChannel.setArchived(true);

  logger.info(logMessageFunctions.closedTicket(ticketThreadId));
};

export const closeInactiveTickets = async () => {
  while (true) {
    const maxTicketInactivityDays = await getConfigProperty(
      'maxTicketInactivityDays',
    );
    const maxTicketInactivityMilliseconds =
      maxTicketInactivityDays * 86_400_000;

    const ticketThreads = await getActiveTickets();

    if (ticketThreads === undefined || ticketThreads.size === 0) {
      await setTimeout(300_000);
      continue;
    }

    for (const thread of ticketThreads.values()) {
      const lastMessage = thread.lastMessage;

      if (lastMessage === null) {
        continue;
      }

      const lastMessageDate = lastMessage.createdAt;

      if (
        Date.now() - lastMessageDate.getTime() >
        maxTicketInactivityMilliseconds
      ) {
        await closeTicket(thread.id);
      }
    }

    await setTimeout(300_000);
  }
};
