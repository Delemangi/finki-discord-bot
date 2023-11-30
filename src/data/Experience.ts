import { databaseErrorFunctions } from "../translations/database.js";
import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Experience, type Prisma } from "@prisma/client";

export const createExperience = async (
  experience?: Prisma.ExperienceCreateInput,
) => {
  if (experience === undefined) {
    return null;
  }

  try {
    return await database.experience.create({
      data: experience,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createExperienceError(error));

    return null;
  }
};

export const getExperienceByUserId = async (userId?: string) => {
  if (userId === undefined) {
    return null;
  }

  try {
    return await database.experience.findUnique({
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getExperienceByUserIdError(error));

    return null;
  }
};

export const getExperienceCount = async () => {
  try {
    return await database.experience.count();
  } catch (error) {
    logger.error(databaseErrorFunctions.getExperienceCountError(error));

    return null;
  }
};

export const getExperienceSorted = async (limit: number = 512) => {
  try {
    return await database.experience.findMany({
      orderBy: {
        experience: "desc",
      },
      take: limit,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getExperienceSortedError(error));

    return null;
  }
};

export const updateExperience = async (experience?: Experience) => {
  if (experience === undefined) {
    return null;
  }

  try {
    return await database.experience.update({
      data: experience,
      where: {
        userId: experience.userId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.updateExperienceError(error));

    return null;
  }
};

export const addExperienceByUserId = async (
  userId?: string,
  experience: number = 0,
) => {
  if (userId === undefined) {
    return null;
  }

  const exp = await getExperienceByUserId(userId);

  if (exp === null) {
    return null;
  }

  exp.experience = BigInt(exp.experience) + BigInt(experience);

  try {
    return await database.experience.update({
      data: {
        experience: exp.experience,
      },
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.addExperienceByUserIdError(error));

    return null;
  }
};

export const addLevelByUserId = async (userId?: string, level: number = 1) => {
  if (userId === undefined) {
    return null;
  }

  const userLevel = await getExperienceByUserId(userId);

  if (userLevel === null) {
    return null;
  }

  userLevel.level += level;

  try {
    return await database.experience.update({
      data: {
        level: userLevel.level,
      },
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.addLevelByUserIdError(error));

    return null;
  }
};
