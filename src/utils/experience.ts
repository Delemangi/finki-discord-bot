import AsyncLock from 'async-lock';
import { type GuildMember, type Message } from 'discord.js';

import { getLevels } from '../configuration/files.js';
import {
  getExperienceMultiplier,
  getExperienceProperty,
  getRolesProperty,
} from '../configuration/main.js';
import {
  createExperience,
  getExperienceByUserId,
  updateExperience,
} from '../data/Experience.js';
import { Channel } from '../lib/schemas/Channel.js';
import { Role } from '../lib/schemas/Role.js';
import { logger } from '../logger.js';
import { experienceMessages } from '../translations/experience.js';
import { logErrorFunctions } from '../translations/logs.js';
import { getChannel } from './channels.js';
import { COUNCIL_LEVEL, REGULAR_LEVEL } from './levels.js';
import { isMemberBarred, isMemberInVip, isMemberLevel } from './members.js';
import { EMOJI_REGEX, URL_REGEX } from './regex.js';

// Golden ratio
const EXPERIENCE_COEFFICIENT = (1 + Math.sqrt(5)) / 2 - 1;
const LEVEL_DELTA = 800n;

const cleanMessage = (message: string) =>
  message.trim().replaceAll(EMOJI_REGEX, '$1').replaceAll(URL_REGEX, '');

const countLinks = (message: string) => URL_REGEX.exec(message)?.length ?? 0;

export const getExperienceFromMessage = async (message: Message) => {
  try {
    await message.fetch();

    const multiplier = getExperienceMultiplier(message.channel.id);

    return (
      BigInt(multiplier) *
      BigInt(
        Math.min(
          50,
          Math.floor(
            1 +
              2 *
                cleanMessage(message.cleanContent).length **
                  EXPERIENCE_COEFFICIENT +
              5 * countLinks(message.cleanContent) ** EXPERIENCE_COEFFICIENT +
              5 * message.attachments.size ** EXPERIENCE_COEFFICIENT +
              5 * message.mentions.users.size ** EXPERIENCE_COEFFICIENT +
              5 * message.mentions.roles.size ** EXPERIENCE_COEFFICIENT +
              5 * message.mentions.channels.size ** EXPERIENCE_COEFFICIENT +
              5 * message.stickers.size,
          ),
        ),
      )
    );
  } catch (error) {
    logger.error(logErrorFunctions.messageResolveError(message.id, error));

    return 0n;
  }
};

export const getLevelFromExperience = (experience: bigint) => {
  let level = 1n;

  while (experience - LEVEL_DELTA * level >= 0) {
    // eslint-disable-next-line no-param-reassign
    experience -= LEVEL_DELTA * level;
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
    const regularRoleId = getRolesProperty(Role.Regulars);

    if (regularRoleId === undefined) {
      return;
    }

    await member.roles.add(regularRoleId);
  }

  if (
    isMemberInVip(member) &&
    (await isMemberLevel(member, COUNCIL_LEVEL, false))
  ) {
    const councilRoleId = getRolesProperty(Role.Council);

    if (councilRoleId === undefined) {
      return;
    }

    await member.roles.add(councilRoleId);

    const vipChannel = getChannel(Channel.VIP);
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
  if (!getExperienceProperty('enabled')) {
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

      const channel = getChannel(Channel.Activity);
      await channel?.send({
        allowedMentions: {
          parse: [],
        },
        content: experienceMessages.levelUp(
          message.author.id,
          currentLevel.level,
          level.toString() === REGULAR_LEVEL.toString() &&
            !(await isMemberBarred(message.author.id)),
        ),
      });
    }
  });
};
