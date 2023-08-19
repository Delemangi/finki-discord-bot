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
