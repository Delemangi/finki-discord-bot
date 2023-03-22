import { client } from './client.js';
import { deleteReminders, loadReminders } from './database.js';
import { userMention } from 'discord.js';
import { setTimeout } from 'node:timers/promises';

export const remind = async () => {
  while (true) {
    const reminders = await loadReminders();

    for (const reminder of reminders) {
      if (reminder.date.getTime() <= Date.now()) {
        if (reminder.private) {
          const user = await client.users.fetch(reminder.owner);

          if (user !== null) {
            await user.send(`Потсетник: ${reminder.description}`);
          }
        } else {
          const channel = await client.channels.fetch(reminder.channel);

          if (channel?.isTextBased()) {
            await channel.send(
              `${userMention(reminder.owner)} Потсетник: ${
                reminder.description
              }`,
            );
          }
        }

        await deleteReminders(reminder);
      }
    }

    await setTimeout(15_000);
  }
};
