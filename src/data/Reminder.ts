import { logger } from "../utils/logger.js";
import { databaseErrorFunctions } from "../utils/strings.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const getReminders = async () => {
  try {
    return await database.reminder.findMany();
  } catch (error) {
    logger.error(databaseErrorFunctions.getRemindersError(error));

    return null;
  }
};

export const createReminder = async (reminder?: Prisma.ReminderCreateInput) => {
  if (reminder === undefined) {
    return null;
  }

  try {
    return await database.reminder.create({
      data: reminder,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createReminderError(error));

    return null;
  }
};

export const deleteReminders = async (reminderIds?: string[]) => {
  if (reminderIds === undefined) {
    return null;
  }

  try {
    return await database.reminder.deleteMany({
      where: {
        id: {
          in: reminderIds,
        },
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteRemindersError(error));

    return null;
  }
};
