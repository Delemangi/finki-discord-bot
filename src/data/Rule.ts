import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const getRules = async () => {
  try {
    return await database.rule.findMany();
  } catch (error) {
    logger.error(`Failed getting rules\n${error}`);
    return [];
  }
};

export const createRule = async (rule?: Prisma.RuleCreateInput) => {
  if (rule === undefined) {
    return null;
  }

  try {
    return await database.rule.create({
      data: rule,
    });
  } catch (error) {
    logger.error(`Failed creating rule\n${error}`);
    return null;
  }
};

export const deleteRule = async (rule?: string) => {
  if (rule === undefined) {
    return null;
  }

  try {
    return await database.rule.delete({
      where: {
        rule,
      },
    });
  } catch (error) {
    logger.error(`Failed deleting rule\n${error}`);
    return null;
  }
};
