import {
  createExperience,
  getExperienceByUserId,
  updateExperience,
} from '../data/Experience.js';
import { experienceMessages } from '../translations/experience.js';
import { getChannel } from './channels.js';
import { getConfigProperty, getLevels, getRoleProperty } from './config.js';
import { COUNCIL_LEVEL, REGULAR_LEVEL } from './levels.js';
import { isMemberBarred, isMemberInVip, isMemberLevel } from './members.js';
import { EMOJI_REGEX, URL_REGEX } from './regex.js';
import AsyncLock from 'async-lock';
import { type GuildMember, type Message } from 'discord.js';

const coefficient = (1 + Math.sqrt(5)) / 2 - 1;

const cleanMessage = (message: string) => {
  return message.trim().replaceAll(EMOJI_REGEX, '$1').replaceAll(URL_REGEX, '');
};

const countLinks = (message: string) => {
  return URL_REGEX.exec(message)?.length ?? 0;
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

export const getLevelFromExperience = (experience: bigint) => {
  const delta = 800n;
  let level = 1n;

  while (experience - delta * level >= 0) {
    // eslint-disable-next-line no-param-reassign
    experience -= delta * level;
    level++;
  }

  return Number(level);
};

const awardMember = async (member: GuildMember, level: number) => {
  const roles = getLevels()[level];

  if (roles === undefined) {
    return;
  }

  await member.roles.add(roles.add);
  await member.roles.remove(roles.remove);

  if (await isMemberBarred(member.id)) {
    return;
  }

  if (await isMemberLevel(member, REGULAR_LEVEL, false)) {
    const regularRoleId = await getRoleProperty('regular');

    await member.roles.add(regularRoleId);
  }

  if (
    (await isMemberInVip(member)) &&
    (await isMemberLevel(member, COUNCIL_LEVEL, false))
  ) {
    const councilRoleId = await getRoleProperty('council');
    await member.roles.add(councilRoleId);

    const vipChannel = getChannel('vip');
    await vipChannel?.send({
      allowedMentions: {
        parse: [],
      },
      content: experienceMessages.council(member.id),
    });
  }
};

const lock = new AsyncLock();

export const addExperience = async (message: Message) => {
  if (!(await getConfigProperty('leveling'))) {
    return;
  }

  if (
    !message.inGuild() ||
    message.system ||
    message.author.bot ||
    message.author.system
  ) {
    return;
  }

  await lock.acquire(message.author.id, async () => {
    const currentLevel =
      (await getExperienceByUserId(message.author.id)) ??
      (await createExperience({
        experience: 0n,
        lastMessage: new Date(),
        level: 0,
        messages: 0,
        userId: message.author.id,
      }));

    if (currentLevel === null) {
      return;
    }

    currentLevel.messages++;

    const experience = await getExperienceFromMessage(message);
    currentLevel.experience = BigInt(currentLevel.experience) + experience;
    const level = getLevelFromExperience(currentLevel.experience);

    await updateExperience(currentLevel);

    if (level !== currentLevel.level) {
      currentLevel.level = level;

      await updateExperience(currentLevel);

      if (message.member === null) {
        return;
      }

      await awardMember(message.member, level);

      const channel = getChannel('activity');
      await channel?.send({
        allowedMentions: {
          parse: [],
        },
        content: experienceMessages.levelUp(
          message.author.id,
          currentLevel.level,
        ),
      });
    }
  });
};
