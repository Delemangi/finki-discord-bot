import { database } from "./database.js";
import { type BotConfig } from "@app/types/BotConfig.js";
import { logger } from "@app/utils/logger.js";

export const getConfig = async () => {
  return await database.config.findFirst();
};

export const setConfig = async (config?: BotConfig) => {
  if (config === undefined) {
    return null;
  }

  try {
    return await database.config.upsert({
      create: {
        name: "config",
        value: config,
      },
      update: {
        value: config,
      },
      where: {
        name: "config",
      },
    });
  } catch (error) {
    logger.error(`Failed setting config\n${error}`);

    return null;
  }
};
