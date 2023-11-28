import { database } from "./database.js";
import { logger } from "@app/utils/logger.js";
import { databaseErrorFunctions } from "@app/utils/strings.js";
import { type Prisma } from "@prisma/client";

export const getPollOptionById = async (optionId?: string) => {
  if (optionId === undefined) {
    return null;
  }

  try {
    return await database.pollOption.findUnique({
      where: {
        id: optionId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getPollOptionByIdError(error));

    return null;
  }
};

export const getPollOptionByPollIdAndName = async (
  pollId?: string,
  optionName?: string,
) => {
  if (pollId === undefined || optionName === undefined) {
    return null;
  }

  try {
    return await database.pollOption.findFirst({
      where: {
        name: optionName,
        pollId,
      },
    });
  } catch (error) {
    logger.error(
      databaseErrorFunctions.getPollOptionByPollIdAndNameError(error),
    );

    return null;
  }
};

export const getMostPopularOptionByPollId = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    return await database.pollOption.findFirst({
      orderBy: {
        votes: {
          _count: "desc",
        },
      },
      where: {
        pollId,
      },
    });
  } catch (error) {
    logger.error(
      databaseErrorFunctions.getMostPopularOptionByPollIdError(error),
    );

    return null;
  }
};

export const deletePollOption = async (optionId?: string) => {
  if (optionId === undefined) {
    return null;
  }

  try {
    return await database.pollOption.delete({
      where: {
        id: optionId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deletePollOptionError(error));

    return null;
  }
};

export const createPollOption = async (
  pollOption?: Prisma.PollOptionCreateInput,
) => {
  if (pollOption === undefined) {
    return null;
  }

  try {
    return await database.pollOption.create({
      data: pollOption,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createPollOptionError(error));

    return null;
  }
};

export const deletePollOptionsByPollIdAndName = async (
  pollId?: string,
  optionName?: string,
) => {
  if (pollId === undefined || optionName === undefined) {
    return null;
  }

  try {
    return await database.pollOption.deleteMany({
      where: {
        name: optionName,
        pollId,
      },
    });
  } catch (error) {
    logger.error(
      databaseErrorFunctions.deletePollOptionsByPollIdAndNameError(error),
    );

    return null;
  }
};
