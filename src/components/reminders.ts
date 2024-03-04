import { truncateString } from './utils.js';
import { type Reminder } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const getRemindersComponents = async (reminders: Reminder[]) => {
  const components = [];

  for (let index1 = 0; index1 < reminders.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      const reminder = reminders[index2];

      if (reminder === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`reminderDelete:${reminder.id}:${reminder.userId}`)
        .setLabel(truncateString(`${index2 + 1}. ${reminder.description}`, 80))
        .setStyle(ButtonStyle.Danger);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};
