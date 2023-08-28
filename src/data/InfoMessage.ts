import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type InfoMessage, type Prisma } from "@prisma/client";

export const createInfoMessage = async (
  message?: Prisma.InfoMessageCreateInput
) => {
  if (message === undefined) {
    return null;
  }

  try {
    return await database.infoMessage.create({
      data: message,
    });
  } catch (error) {
    logger.error(`Failed creating info message\n${error}`);
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
    logger.error(`Failed getting info message\n${error}`);
    return null;
  }
};

export const getInfoMessages = async () => {
  try {
    return await database.infoMessage.findMany({
      orderBy: {
        index: "asc",
      },
    });
  } catch (error) {
    logger.error(`Failed getting info messages\n${error}`);
    return [];
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
    logger.error(`Failed updating info message\n${error}`);
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
    logger.error(`Failed deleting info message\n${error}`);
    return null;
  }
};
