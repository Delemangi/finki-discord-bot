import { type Prisma } from '@prisma/client';

import { logger } from '../../logger.js';
import { databaseErrorFunctions } from '../../translations/database.js';
import { database } from './database.js';

export const getBars = async () => {
  try {
    return await database.bar.findMany({
      orderBy: {
        userId: 'asc',
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getBarsError(error));

    return null;
  }
};

export const getBarByUserId = async (userId?: string) => {
  if (userId === undefined) {
    return null;
  }

  try {
    return await database.bar.findFirst({
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getBarByUserIdError(error));

    return null;
  }
};

export const createBar = async (bar?: Prisma.BarCreateInput) => {
  if (bar === undefined) {
    return null;
  }

  try {
    return await database.bar.create({
      data: bar,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createBarError(error));

    return null;
  }
};

export const deleteBar = async (userId?: string) => {
  if (userId === undefined) {
    return null;
  }

  try {
    return await database.bar.delete({
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteBarError(error));

    return null;
  }
};
