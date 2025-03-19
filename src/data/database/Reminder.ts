import { type Prisma } from '@prisma/client';

import { logger } from '../../logger.js';
import { databaseErrorFunctions } from '../../translations/database.js';
import { database } from './connection.js';

export const getReminders = async () => {
  try {
    return await database.reminder.findMany();
  } catch (error) {
    logger.error(databaseErrorFunctions.getRemindersError(error));

    return null;
  }
};

export const getRemindersByUserId = async (userId?: string) => {
  if (userId === undefined) {
    return null;
  }

  try {
    return await database.reminder.findMany({
      orderBy: {
        timestamp: 'asc',
      },
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getRemindersByUserIdError(error));

    return null;
  }
};

export const getReminderById = async (reminderId?: string) => {
  if (reminderId === undefined) {
    return null;
  }

  try {
    return await database.reminder.findUnique({
      where: {
        id: reminderId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getReminderByIdError(error));

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

export const deleteReminder = async (reminderId?: string) => {
  if (reminderId === undefined) {
    return null;
  }

  try {
    return await database.reminder.delete({
      where: {
        id: reminderId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteReminderError(error));

    return null;
  }
};
