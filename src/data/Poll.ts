import { databaseErrorFunctions } from "../translations/database.js";
import { type PollWithOptions } from "../types/PollWithOptions.js";
import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const createPoll = async (poll?: Prisma.PollCreateInput) => {
  if (poll === undefined) {
    return null;
  }

  try {
    return await database.poll.create({
      data: poll,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createPollError(error));

    return null;
  }
};

export const updatePoll = async (poll?: PollWithOptions) => {
  if (poll === undefined) {
    return null;
  }

  try {
    const { id, options, ...rest } = poll;
    return await database.poll.update({
      data: {
        ...rest,
        options: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          upsert: options.map(({ pollId, ...optionRest }) => ({
            create: optionRest,
            update: optionRest,
            where: {
              id: optionRest.id,
            },
          })),
        },
      },
      where: {
        id,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.updatePollError(error));

    return null;
  }
};

export const getPolls = async () => {
  try {
    return await database.poll.findMany({
      include: {
        options: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getPollsError(error));

    return null;
  }
};

export const getPollById = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    return await database.poll.findUnique({
      include: {
        options: {
          orderBy: {
            name: "asc",
          },
        },
      },
      where: {
        id: pollId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getPollByIdError(error));

    return null;
  }
};

export const deletePoll = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    return await database.poll.delete({
      where: {
        id: pollId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deletePollError(error));

    return null;
  }
};
