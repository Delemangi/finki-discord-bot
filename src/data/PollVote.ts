import { database } from "./database.js";
import { logger } from "@app/utils/logger.js";
import { databaseErrorFunctions } from "@app/utils/strings.js";
import { type Prisma } from "@prisma/client";

export const getPollVotesByPollId = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    return await database.pollVote.findMany({
      include: {
        option: true,
      },
      where: {
        option: {
          poll: {
            id: pollId,
          },
        },
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getPollVotesByPollIdError(error));

    return null;
  }
};

export const getPollVotesByPollIdAndUserId = async (
  pollId?: string,
  userId?: string,
) => {
  if (pollId === undefined || userId === undefined) {
    return null;
  }

  try {
    return await database.pollVote.findMany({
      include: {
        option: true,
      },
      where: {
        option: {
          poll: {
            id: pollId,
          },
        },
        userId,
      },
    });
  } catch (error) {
    logger.error(
      databaseErrorFunctions.getPollVotesByPollIdAndUserIdError(error),
    );

    return null;
  }
};

export const getPollVotesByOptionId = async (optionId?: string) => {
  if (optionId === undefined) {
    return null;
  }

  try {
    return await database.pollVote.findMany({
      include: {
        option: true,
      },
      where: {
        option: {
          id: optionId,
        },
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getPollVotesByOptionIdError(error));

    return null;
  }
};

export const countPollVotesByOptionId = async (optionId?: string) => {
  if (optionId === undefined) {
    return null;
  }

  try {
    return await database.pollVote.count({
      where: {
        option: {
          id: optionId,
        },
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.countPollVotesByOptionIdError(error));

    return null;
  }
};

export const createPollVote = async (pollVote?: Prisma.PollVoteCreateInput) => {
  if (pollVote === undefined) {
    return null;
  }

  try {
    return await database.pollVote.create({
      data: pollVote,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createPollVoteError(error));

    return null;
  }
};

export const deletePollVote = async (voteId?: string) => {
  if (voteId === undefined) {
    return null;
  }

  try {
    return await database.pollVote.delete({
      where: {
        id: voteId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deletePollVoteError(error));

    return null;
  }
};
