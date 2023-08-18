import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const getVipPollById = async (pollId?: string) => {
  if (database === undefined || pollId === undefined) {
    return null;
  }

  try {
    return await database.vipPoll.findFirst({
      where: {
        pollId,
      },
    });
  } catch (error) {
    logger.error(`Failed obtaining VIP poll by poll ID\n${error}`);
    return null;
  }
};

export const getVipPollByUserAndType = async (
  userId?: string,
  type?: string
) => {
  if (database === undefined || userId === undefined || type === undefined) {
    return null;
  }

  try {
    return await database.vipPoll.findFirst({
      where: {
        type,
        userId,
      },
    });
  } catch (error) {
    logger.error(`Failed obtaining VIP poll by user ID\n${error}`);
    return null;
  }
};

export const createVipPoll = async (vipPoll?: Prisma.VipPollCreateInput) => {
  if (database === undefined || vipPoll === undefined) {
    return null;
  }

  try {
    return await database.vipPoll.create({
      data: vipPoll,
    });
  } catch (error) {
    logger.error(`Failed creating VIP poll\n${error}`);
    return null;
  }
};

export const deleteVipPoll = async (id?: string) => {
  if (database === undefined || id === undefined) {
    return null;
  }

  try {
    return await database.vipPoll.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    logger.error(`Failed deleting VIP poll\n${error}`);
    return null;
  }
};

export const deleteVipPollByPollId = async (pollId?: string) => {
  if (database === undefined || pollId === undefined) {
    return null;
  }

  try {
    return await database.vipPoll.delete({
      where: {
        pollId,
      },
    });
  } catch (error) {
    logger.error(`Failed deleting VIP poll by poll ID\n${error}`);
    return null;
  }
};

export const getVipPolls = async () => {
  if (database === undefined) {
    return [];
  }

  try {
    return await database.vipPoll.findMany();
  } catch (error) {
    logger.error(`Failed obtaining VIP polls\n${error}`);
    return [];
  }
};
