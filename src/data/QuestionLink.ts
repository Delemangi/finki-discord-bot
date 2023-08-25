import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const createQuestionLink = async (
  link?: Prisma.QuestionLinkCreateInput
) => {
  if (link === undefined) {
    return null;
  }

  try {
    return await database.questionLink.create({
      data: link,
    });
  } catch (error) {
    logger.error(`Failed creating question link\n${error}`);
    return null;
  }
};

export const createQuestionLinks = async (
  links?: Prisma.QuestionLinkCreateManyInput[]
) => {
  if (links === undefined) {
    return [];
  }

  try {
    return await database.questionLink.createMany({
      data: links,
    });
  } catch (error) {
    logger.error(`Failed creating question links\n${error}`);
    return [];
  }
};

export const deleteQuestionLinksByQuestionId = async (questionId?: string) => {
  if (questionId === undefined) {
    return null;
  }

  try {
    return await database.questionLink.deleteMany({
      where: {
        questionId,
      },
    });
  } catch (error) {
    logger.error(`Failed deleting question links\n${error}`);
    return null;
  }
};