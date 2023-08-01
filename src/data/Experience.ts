import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Experience, type Prisma } from "@prisma/client";

export const createExperience = async (
  experience?: Prisma.ExperienceCreateInput
) => {
  if (database === undefined || experience === undefined) {
    return null;
  }

  try {
    return await database.experience.create({
      data: experience,
    });
  } catch (error) {
    logger.error(`Failed creating experience\n${error}`);
    return null;
  }
};

export const getExperienceByUserId = async (userId?: string) => {
  if (database === undefined || userId === undefined) {
    return null;
  }

  try {
    return await database.experience.findUnique({
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(`Failed getting experience by user ID\n${error}`);
    return null;
  }
};

export const getExperienceCount = async () => {
  if (database === undefined) {
    return null;
  }

  try {
    return await database.experience.count();
  } catch (error) {
    logger.error(`Failed getting experience count\n${error}`);
    return null;
  }
};

export const getExperienceSorted = async (limit: number = 512) => {
  if (database === undefined) {
    return null;
  }

  try {
    return await database.experience.findMany({
      orderBy: {
        experience: "desc",
      },
      take: limit,
    });
  } catch (error) {
    logger.error(`Failed getting experience sorted\n${error}`);
    return null;
  }
};

export const updateExperience = async (experience?: Experience) => {
  if (
    database === undefined ||
    experience === undefined ||
    experience.userId === undefined
  ) {
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
    logger.error(`Failed updating experience\n${error}`);
    return null;
  }
};

export const addExperienceByUserId = async (
  userId?: string,
  experience: number = 0
) => {
  if (database === undefined || userId === undefined) {
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
    logger.error(`Failed adding experience by user ID\n${error}`);
    return null;
  }
};

export const addLevelByUserId = async (userId?: string, level: number = 1) => {
  if (database === undefined || userId === undefined) {
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
    logger.error(`Failed adding experience by user ID\n${error}`);
    return null;
  }
};
