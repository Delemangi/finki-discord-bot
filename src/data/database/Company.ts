import { type Prisma } from '@prisma/client';

import { logger } from '../../logger.js';
import { databaseErrorFunctions } from '../../translations/database.js';
import { database } from './database.js';

export const getCompanies = async () => {
  try {
    return await database.company.findMany();
  } catch (error) {
    logger.error(databaseErrorFunctions.getCompaniesError(error));
    return null;
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
    logger.error(databaseErrorFunctions.createCompanyError(error));

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
    logger.error(databaseErrorFunctions.deleteCompanyError(error));

    return null;
  }
};

export const createCompanies = async (
  companies?: Prisma.CompanyCreateManyInput[],
) => {
  if (companies === undefined) {
    return null;
  }

  try {
    return await database.company.createMany({
      data: companies,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createCompaniesError(error));

    return null;
  }
};
