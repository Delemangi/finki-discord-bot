import { client } from "./client.js";
import { logger } from "./logger.js";
import { deleteReminder, getReminders } from "@app/data/Reminder.js";
import { labels } from "@app/translations/labels.js";
import { logErrorFunctions } from "@app/translations/logs.js";
import { type Reminder } from "@prisma/client";
import { userMention } from "discord.js";
import { setTimeout } from "node:timers/promises";

const remindUser = async (reminder: Reminder) => {
  if (reminder.privateMessage) {
    const user = await client.users.fetch(reminder.userId);

    if (user !== null) {
      await user.send(`${labels.reminder}: ${reminder.description}`);
    }
  } else {
    if (reminder.channelId === null) {
      return;
    }

    const channel = await client.channels.fetch(reminder.channelId);

    if (channel?.isTextBased()) {
      await channel.send({
        allowedMentions: {
          roles: [],
          users: [reminder.userId],
        },
        content: `${userMention(reminder.userId)} ${labels.reminder}: ${
          reminder.description
        }`,
      });
    }
  }
};

export const remind = async () => {
  while (true) {
    try {
      const reminders = await getReminders();

      if (reminders === null) {
        await setTimeout(15_000);
        continue;
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

    await setTimeout(15_000);
  }
};
