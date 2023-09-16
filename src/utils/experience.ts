import {
  createExperience,
  getExperienceByUserId,
  updateExperience,
} from "../data/Experience.js";
import { getVipBanByUserId } from "../data/VipBan.js";
import { getChannel } from "./channels.js";
import { getConfigProperty, getLevels } from "./config.js";
import { logger } from "./logger.js";
import { getUsername, isMemberInVip } from "./members.js";
import AsyncLock from "async-lock";
import { type GuildMember, type Message } from "discord.js";

const coefficient = (1 + Math.sqrt(5)) / 2 - 1;

const cleanMessage = (message: string) => {
  return message
    .trim()
    .replaceAll(/<:(\w)+:\d+>/gu, "$1")
    .replaceAll(/\bhttps?:\/\/\S+/gu, "");
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
          5 * message.stickers.size
      )
    )
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

  const vipBan = await getVipBanByUserId(member.id);
  if ((await isMemberInVip(member)) || vipBan !== null) {
    const vipInvitedRole = (await getConfigProperty("roles")).vipInvited;
    await member.roles.add(roles.add.filter((role) => role !== vipInvitedRole));

    logger.info(
      `User ${member.user.tag} does not qualify for VIP, skipping giving him the role...`
    );
  } else {
    await member.roles.add(roles.add);
  }

  await member.roles.remove(roles.remove);
};

const lock = new AsyncLock();

export const addExperience = async (message: Message) => {
  if (!(await getConfigProperty("leveling"))) {
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
      logger.warn(
        `Couldn't get or create experience for user ${await getUsername(
          message.author.id
        )}`
      );
      return;
    }

    currentLevel.messages++;

    const experience = await getExperienceFromMessage(message);
    currentLevel.experience = BigInt(currentLevel.experience) + experience;
    const level = getLevelFromExperience(currentLevel.experience);

    if (level !== currentLevel.level) {
      currentLevel.level = level;

      const channel = getChannel("activity");

      if (channel !== undefined) {
        await channel.send({
          allowedMentions: { parse: [] },
          content: `Честитки, ${message.author}! Сега сте ниво ${currentLevel.level}!`,
        });
      }

      await awardMember(message.member, currentLevel.level);
    }

    await updateExperience(currentLevel);
  });
};
