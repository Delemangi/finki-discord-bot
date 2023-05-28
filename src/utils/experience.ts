import { Experience } from '../entities/Experience.js';
import { getChannel } from './channels.js';
import { getFromBotConfig, getLevels } from './config.js';
import { getExperienceByUserId, saveExperience } from './database.js';
import AsyncLock from 'async-lock';
import { type GuildMember, type Message } from 'discord.js';

const coefficient = (1 + Math.sqrt(5)) / 2 - 1;

const cleanMessage = (message: string) => {
  return message
    .trim()
    .replaceAll(/<:(\w)+:\d+>/gu, '$1')
    .replaceAll(/\bhttps?:\/\/\S+/gu, '');
};

const countLinks = (message: string) => {
  return message.match(/\bhttps?:\/\/\S+/gu)?.length ?? 0;
};

const getExperienceFromMessage = async (message: Message) => {
  await message.fetch();

  return BigInt(
    Math.min(
      50,
      Math.floor(
        1 +
          2 * cleanMessage(message.cleanContent).length ** coefficient +
          5 * countLinks(message.cleanContent) ** coefficient +
          5 * message.attachments.size ** coefficient +
          5 * message.mentions.users.size ** coefficient +
          5 * message.mentions.roles.size ** coefficient +
          5 * message.mentions.channels.size ** coefficient +
          5 * message.stickers.size,
      ),
    ),
  );
};

const getLevelFromExperience = (experience: bigint) => {
  const delta = 800n;
  let level = 1n;

  while (experience - delta * level >= 0) {
    // eslint-disable-next-line no-param-reassign
    experience -= delta * level;
    level++;
  }

  return Number(level);
};

const awardMember = async (member: GuildMember | null, level: number) => {
  const roles = getLevels()[level];

  if (roles === undefined || member === null) {
    return;
  }

  await member.roles.add(roles.add);
  await member.roles.remove(roles.remove);
};

const lock = new AsyncLock();

export const addExperience = async (message: Message) => {
  if (!getFromBotConfig('leveling')) {
    return;
  }

  if (message.author.bot || message.author.system || message.guild === null) {
    return;
  }

  await lock.acquire(message.author.id, async () => {
    let currentLevel = await getExperienceByUserId(message.author.id);

    if (currentLevel === null) {
      currentLevel = new Experience();
      currentLevel.user = message.author.id;
      currentLevel.tag = message.author.tag;
      currentLevel.messages = 0;
      currentLevel.level = 0;
      currentLevel.experience = 0n;
    }

    currentLevel.messages++;

    const experience = await getExperienceFromMessage(message);
    currentLevel.experience = BigInt(currentLevel.experience) + experience;
    const level = getLevelFromExperience(currentLevel.experience);

    if (level !== currentLevel.level) {
      currentLevel.level = level;

      const channel = getChannel('activity');

      if (channel !== undefined) {
        await channel.send({
          allowedMentions: { parse: [] },
          content: `Честитки, ${message.author}! Сега сте ниво ${currentLevel.level}!`,
        });
      }

      await awardMember(message.member, currentLevel.level);
    }

    await saveExperience(currentLevel);
  });
};
