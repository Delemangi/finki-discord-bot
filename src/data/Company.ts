import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const getCompanies = async () => {
  try {
    return await database.company.findMany();
  } catch (error) {
    logger.error(`Failed getting companies\n${error}`);
    return [];
  }
};

export const createCompany = async (company?: Prisma.CompanyCreateInput) => {
  if (company === undefined) {
    return null;
  }

  try {
    return await database.company.create({
      data: company,
    });
  } catch (error) {
    logger.error(`Failed creating company\n${error}`);
    return null;
  }
};

export const deleteCompany = async (company?: string) => {
  if (company === undefined) {
    return null;
  }

  try {
    return await database.company.delete({
      where: {
        name: company,
      },
    });
  } catch (error) {
    logger.error(`Failed deleting company\n${error}`);
    return null;
  }
};

export const createCompanies = async (
  companies?: Prisma.CompanyCreateManyInput[]
) => {
  if (companies === undefined) {
    return null;
  }

  try {
    return await database.company.createMany({
      data: companies,
    });
  } catch (error) {
    logger.error(`Failed creating companies\n${error}`);
    return null;
  }
};
