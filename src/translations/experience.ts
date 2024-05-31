import { COUNCIL_LEVEL } from '../utils/levels.js';
import { userMention } from 'discord.js';

export const experienceMessages = {
  council: (userId: string) =>
    `# Корисникот ${userMention(
      userId,
    )} достигна ниво ${COUNCIL_LEVEL} и стана член на Советот!`,

  levelUp: (userId: string, level: number, isRegular: boolean | string) =>
    `Корисникот ${userMention(userId)} достигна ниво ${level}.${
      isRegular ? ' Корисникот е сега член на редовните корисници!' : ''
    }`,
};
