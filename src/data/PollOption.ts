import { logger } from "../utils/logger.js";
import { database } from "./database.js";
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
    logger.error(`Failed obtaining poll option ID\n${error}`);
    return null;
  }
};

export const getPollOptionByPollIdAndName = async (
  pollId?: string,
  optionName?: string
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
      `Failed obtaining poll option by poll ID and option name\n${error}`
    );
    return null;
  }
};

export const getMostPopularOptionByPollId = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    const pollVotes = await database.pollVote.findMany({
      include: { option: true },
      where: { option: { poll: { id: pollId } } },
    });

    if (pollVotes.length === 0) {
      return null;
    }

    const optionIds = pollVotes.map((pollVote) => pollVote.option.id);
    optionIds.sort(
      (a, b) =>
        optionIds.filter((option) => option === a).length -
        optionIds.filter((option) => option === b).length
    );
    const optionId = optionIds.shift();

    if (optionId === undefined) {
      return null;
    }

    return await database.pollOption.findUnique({
      where: { id: optionId },
    });
  } catch (error) {
    logger.error(
      `Failed obtaining most popular poll option by poll ID\n${error}`
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
    logger.error(`Failed deleting poll option by option ID\n${error}`);
    return null;
  }
};

export const createPollOption = async (
  pollOption?: Prisma.PollOptionCreateInput
) => {
  if (pollOption === undefined) {
    return null;
  }

  try {
    return await database.pollOption.create({
      data: pollOption,
    });
  } catch (error) {
    logger.error(`Failed creating poll option\n${error}`);
    return null;
  }
};

export const deletePollOptionsByPollIdAndName = async (
  pollId?: string,
  optionName?: string
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
      `Failed deleting poll options by poll ID and option name\n${error}`
    );
    return null;
  }
};
