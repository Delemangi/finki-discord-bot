import { userMention } from "discord.js";

export const experienceMessages = {
  levelUp: (userId: string, level: number | string) =>
    `Корисникот ${userMention(userId)} достигна ниво ${level}.`,
};
