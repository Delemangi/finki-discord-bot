import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const getQuestions = async () => {
  try {
    return await database.question.findMany();
  } catch (error) {
    logger.error(`Failed obtaining questions\n${error}`);
    return [];
  }
};

export const getQuestionNames = async () => {
  try {
    return await database.question.findMany({
      select: { name: true },
    });
  } catch (error) {
    logger.error(`Failed obtaining question names\n${error}`);
    return [];
  }
};

export const getQuestion = async (name?: string) => {
  if (name === undefined) {
    return null;
  }

  try {
    return await database.question.findFirst({
      where: { name },
    });
  } catch (error) {
    logger.error(`Failed obtaining question\n${error}`);
    return null;
  }
};

export const createQuestion = async (question?: Prisma.QuestionCreateInput) => {
  if (question === undefined) {
    return null;
  }

  try {
    return await database.question.create({
      data: question,
    });
  } catch (error) {
    logger.error(`Failed creating question\n${error}`);
    return null;
  }
};

export const updateQuestion = async (
  name?: string,
  question?: Prisma.QuestionUpdateInput
) => {
  if (name === undefined || question === undefined) {
    return null;
  }

  try {
    return await database.question.update({
      data: question,
      where: { name },
    });
  } catch (error) {
    logger.error(`Failed updating question\n${error}`);
    return null;
  }
};

export const deleteQuestion = async (name?: string) => {
  if (name === undefined) {
    return null;
  }

  try {
    return await database.question.delete({
      where: { name },
    });
  } catch (error) {
    logger.error(`Failed deleting question\n${error}`);
    return null;
  }
};
