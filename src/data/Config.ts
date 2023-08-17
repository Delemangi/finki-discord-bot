import { type BotConfig } from "../types/BotConfig.js";
import { database } from "./database.js";

export const getConfig = async () => {
  return await database.config.findFirst();
};

export const setConfig = async (config?: BotConfig) => {
  if (database === undefined || config === undefined) {
    return null;
  }

  return await database.config.upsert({
    create: { name: "config", value: config },
    update: { value: config },
    where: { name: "config" },
  });
};
