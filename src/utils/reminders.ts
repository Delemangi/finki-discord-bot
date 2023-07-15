import { type Reminder } from '../models/Reminder.js';
import { client } from './client.js';
import { deleteReminders, loadReminders } from './database.js';
import { logger } from './logger.js';
import { userMention } from 'discord.js';
import { setTimeout } from 'node:timers/promises';

const remindUser = async (reminder: Reminder) => {
  if (reminder.private) {
    const user = await client.users.fetch(reminder.owner);

    if (user !== null) {
      await user.send(`Потсетник: ${reminder.description}`);
    }
  } else {
    const channel = await client.channels.fetch(reminder.channel);

    if (channel?.isTextBased()) {
      await channel.send({
        allowedMentions: { roles: [], users: [reminder.owner] },
        content: `${userMention(reminder.owner)} Потсетник: ${
          reminder.description
        }`,
      });
    }
  }
};

export const remind = async () => {
  while (true) {
    try {
      const reminders = await loadReminders();

      for (const reminder of reminders) {
        if (reminder.date.getTime() <= Date.now()) {
          await remindUser(reminder);

          await deleteReminders(reminder);
        }
      }
    } catch {
      logger.warn('Failed to load reminders. Retrying in 15 seconds');
    }

    await setTimeout(15_000);
  }
};
