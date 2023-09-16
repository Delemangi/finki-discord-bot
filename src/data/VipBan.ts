import { logger } from "../utils/logger.js";
import { database } from "./database.js";
import { type Prisma } from "@prisma/client";

export const getVipBans = async () => {
  try {
    return await database.vipBan.findMany({
      orderBy: {
        userId: "asc",
      },
    });
  } catch (error) {
    logger.error(`Failed obtaining vip bans\n${error}`);
    return [];
  }
};

export const getVipBanByUserId = async (userId?: string) => {
  if (userId === undefined) {
    return null;
  }

  try {
    return await database.vipBan.findFirst({
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(`Failed obtaining vip ban\n${error}`);
    return null;
  }
};

export const createVipBan = async (vipBan?: Prisma.VipBanCreateInput) => {
  if (vipBan === undefined) {
    return null;
  }

  try {
    return await database.vipBan.create({
      data: vipBan,
    });
  } catch (error) {
    logger.error(`Failed creating vip ban\n${error}`);
    return null;
  }
};

export const deleteVipBan = async (userId?: string) => {
  if (userId === undefined) {
    return null;
  }

  try {
    return await database.vipBan.delete({
      where: {
        userId,
      },
    });
  } catch (error) {
    logger.error(`Failed deleting vip ban\n${error}`);
    return null;
  }
};
