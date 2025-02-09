import { type Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';

import { logger } from '../logger.js';
import { databaseErrorFunctions } from '../translations/database.js';
import { database } from './database.js';

export const createAnto = async (anto?: Prisma.AntoCreateInput) => {
  if (anto === undefined) {
    return null;
  }

  try {
    return await database.anto.create({
      data: anto,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createAntoError(error));

    return null;
  }
};

export const deleteAnto = async (anto?: string) => {
  if (anto === undefined) {
    return null;
  }

  try {
    return await database.anto.delete({
      where: {
        quote: anto,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteAntoError(error));

    return null;
  }
};

export const getRandomAnto = async () => {
  try {
    const count = await database.anto.count();
    const randomNumber = (randomBytes(1).readUInt8(0) / 255) * count;
    const skip = Math.floor(randomNumber);

    return await database.anto.findFirst({
      skip,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getRandomAntoError(error));

    return null;
  }
};

export const createAntos = async (antos?: Prisma.AntoCreateManyInput[]) => {
  if (antos === undefined) {
    return null;
  }

  try {
    return await database.anto.createMany({
      data: antos,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createAntosError(error));

    return null;
  }
};
