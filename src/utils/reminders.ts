import { deleteReminders, getReminders } from "../data/Reminder.js";
import { client } from "./client.js";
import { logger } from "./logger.js";
import { type Reminder } from "@prisma/client";
import { userMention } from "discord.js";
import { setTimeout } from "node:timers/promises";

const remindUser = async (reminder: Reminder) => {
  if (reminder.privateMessage) {
    const user = await client.users.fetch(reminder.userId);

    if (user !== null) {
      await user.send(`Потсетник: ${reminder.description}`);
    }
  } else {
    if (reminder.channelId === null) {
      return;
    }

    const channel = await client.channels.fetch(reminder.channelId);

    if (channel?.isTextBased()) {
      await channel.send({
        allowedMentions: { roles: [], users: [reminder.userId] },
        content: `${userMention(reminder.userId)} Потсетник: ${
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

      for (const reminder of reminders) {
        if (reminder.timestamp.getTime() <= Date.now()) {
          await remindUser(reminder);
        }
      }

      await deleteReminders(reminders.map((reminder) => reminder.id));
    } catch {
      logger.warn("Failed to load reminders. Retrying in 15 seconds");
    }

    await setTimeout(15_000);
  }
};
