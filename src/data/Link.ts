import { logger } from "../utils/logger.js";
import { databaseErrorFunctions } from "../utils/strings.js";
import { database } from "./database.js";
import { type Link, type Prisma } from "@prisma/client";

export const getLinks = async () => {
  try {
    return await database.link.findMany({
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getLinksError(error));
    return null;
  }
};

export const getLinkNames = async () => {
  try {
    return await database.link.findMany({
      select: {
        name: true,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getLinkNamesError(error));
    return null;
  }
};

export const getLink = async (name?: string) => {
  if (name === undefined) {
    return null;
  }

  try {
    return await database.link.findFirst({
      where: {
        name,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getLinkError(error));
    return null;
  }
};

export const createLink = async (link?: Prisma.LinkCreateInput) => {
  if (link === undefined) {
    return null;
  }

  try {
    return await database.link.create({
      data: link,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.createLinkError(error));
    return null;
  }
};

export const updateLink = async (link?: Link) => {
  if (link === undefined) {
    return null;
  }

  try {
    return await database.link.update({
      data: link,
      where: {
        name: link.name,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.updateLinkError(error));
    return null;
  }
};

export const deleteLink = async (name?: string) => {
  if (name === undefined) {
    return null;
  }

  try {
    return await database.link.delete({
      where: {
        name,
      },
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteLinkError(error));
    return null;
  }
};

export const getNthLink = async (index?: number) => {
  if (index === undefined) {
    return null;
  }

  try {
    return await database.link.findFirst({
      orderBy: {
        name: "asc",
      },
      skip: index - 1,
    });
  } catch (error) {
    logger.error(databaseErrorFunctions.getNthLinkError(error));
    return null;
  }
};
