import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const createAnto = async (anto?: Prisma.AntoCreateInput) => {
  if (anto === undefined) {
    return null;
  }

  try {
    return await database.anto.create({
      data: anto,
    });
  } catch (error) {
    logger.error(`Failed creating anto\n${error}`);
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
    logger.error(`Failed deleting anto\n${error}`);
    return null;
  }
};

export const getRandomAnto = async () => {
  try {
    const count = await database.anto.count();
    const skip = Math.floor(Math.random() * count);

    return await database.anto.findFirst({
      skip,
    });
  } catch (error) {
    logger.error(`Failed getting random anto\n${error}`);
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
    logger.error(`Failed creating antos\n${error}`);
    return null;
  }
};
