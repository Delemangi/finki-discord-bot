import { type Reminder } from '@prisma/client';
import { userMention } from 'discord.js';

import { client } from '../client.js';
import { deleteReminder, getReminders } from '../data/database/Reminder.js';
import { logger } from '../logger.js';
import { labels } from '../translations/labels.js';
import { logErrorFunctions } from '../translations/logs.js';

const remindUser = async (reminder: Reminder) => {
  if (reminder.privateMessage) {
    const user = await client.users.fetch(reminder.userId);

    await user.send(`${labels.reminder}: ${reminder.description}`);

    return;
  }

  if (reminder.channelId === null) {
    return;
  }

  const channel = await client.channels.fetch(reminder.channelId);

  if (!channel?.isSendable()) {
    return;
  }

  await channel.send({
    allowedMentions: {
      parse: ['users'],
    },
    content: `${userMention(reminder.userId)} ${labels.reminder}: ${
      reminder.description
    }`,
  });
};

export const sendReminders = async () => {
  try {
    const reminders = await getReminders();

    if (reminders === null) {
      return;
    }

    for (const reminder of reminders) {
      if (reminder.timestamp.getTime() <= Date.now()) {
        await remindUser(reminder);
        await deleteReminder(reminder.id);
      }
    }
  } catch (error) {
    logger.error(logErrorFunctions.reminderLoadError(error));
  }
};
