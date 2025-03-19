import { type InfoMessage, type Prisma } from '@prisma/client';

import { logger } from '../../logger.js';
import { databaseErrorFunctions } from '../../translations/database.js';
import { database } from './connection.js';

export const createInfoMessage = async (
  message?: Prisma.InfoMessageCreateInput,
) => {
  if (message === undefined) {
    return null;
  }

  try {
    return await database.infoMessage.create({
      data: message,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createInfoMessageError(error));

    return null;
  }
};

export const getInfoMessage = async (index?: number) => {
  if (index === undefined) {
    return null;
  }

  try {
    return await database.infoMessage.findUnique({
      where: {
        index,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getInfoMessageError(error));

    return null;
  }
};

export const getInfoMessages = async () => {
  try {
    return await database.infoMessage.findMany({
      orderBy: {
        index: 'asc',
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getInfoMessagesError(error));

    return null;
  }
};

export const updateInfoMessage = async (message?: InfoMessage) => {
  if (message === undefined) {
    return null;
  }

  try {
    return await database.infoMessage.update({
      data: message,
      where: {
        index: message.index,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.updateInfoMessageError(error));

    return null;
  }
};

export const deleteInfoMessage = async (index?: number) => {
  if (index === undefined) {
    return null;
  }

  try {
    return await database.infoMessage.delete({
      where: {
        index,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteInfoMessageError(error));

    return null;
  }
};
