import { database } from "./database.js";
import { databaseErrorFunctions } from "@app/translations/database.js";
import { logger } from "@app/utils/logger.js";
import { type Prisma } from "@prisma/client";

export const getSpecialPollById = async (id?: string) => {
  if (id === undefined) {
    return null;
  }

  try {
    return await database.specialPoll.findFirst({
      where: {
        id,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getSpecialPollByIdError(error));

    return null;
  }
};

export const getSpecialPollByPollId = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    return await database.specialPoll.findFirst({
      where: {
        pollId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getSpecialPollByPollIdError(error));

    return null;
  }
};

export const getSpecialPollByUserAndType = async (
  userId?: string,
  type?: string,
) => {
  if (userId === undefined || type === undefined) {
    return null;
  }

  try {
    return await database.specialPoll.findFirst({
      where: {
        type,
        userId,
      },
    });
  } catch (error) {
    logger.error(
      databaseErrorFunctions.getSpecialPollByUserAndTypeError(error),
    );

    return null;
  }
};

export const createSpecialPoll = async (
  vipPoll?: Prisma.SpecialPollCreateInput,
) => {
  if (vipPoll === undefined) {
    return null;
  }

  try {
    return await database.specialPoll.create({
      data: vipPoll,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createSpecialPollError(error));

    return null;
  }
};

export const deleteSpecialPoll = async (id?: string) => {
  if (id === undefined) {
    return null;
  }

  try {
    return await database.specialPoll.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteSpecialPollError(error));

    return null;
  }
};

export const deleteSpecialPollByPollId = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    return await database.specialPoll.delete({
      where: {
        pollId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteSpecialPollByPollIdError(error));

    return null;
  }
};

export const getSpecialPolls = async () => {
  try {
    return await database.specialPoll.findMany();
  } catch (error) {
    logger.error(databaseErrorFunctions.getSpecialPollsError(error));

    return null;
  }
};
