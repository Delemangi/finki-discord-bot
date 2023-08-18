import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const getQuestions = async () => {
  return await database.question.findMany();
};

export const getQuestionNames = async () => {
  return await database.question.findMany({
    select: { name: true },
  });
};

export const getQuestion = async (name: string) => {
  return await database.question.findFirst({
    where: { name },
  });
};

export const createQuestion = async (question: Prisma.QuestionCreateInput) => {
  return await database.question.create({
    data: question,
  });
};

export const updateQuestion = async (
  name: string,
  question: Prisma.QuestionUpdateInput
) => {
  return await database.question.update({
    data: question,
    where: { name },
  });
};
