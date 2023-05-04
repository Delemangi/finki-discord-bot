import { Experience } from '../entities/Experience.js';
import { getChannel } from './channels.js';
import { getLevels } from './config.js';
import { getExperienceByUserId, saveExperience } from './database.js';
import { type GuildMember, type Message } from 'discord.js';

const getExperienceFromMessage = (message: Message) => {
  return 1 + message.content.length + 20 * message.attachments.size;
};

const getLevelFromExperience = (experience: number) => {
  return 1 + Math.floor(Math.log1p(experience));
};

const awardMember = async (member: GuildMember | null, level: number) => {
  const roles = getLevels()[level];

  if (roles === undefined || member === null) {
    return;
  }

  await member.roles.add(roles.add);
  await member.roles.remove(roles.remove);
};

export const addExperience = async (message: Message) => {
  if (message.author.bot || message.author.system || message.guild === null) {
    return;
  }

  let currentLevel = await getExperienceByUserId(message.author.id);

  if (currentLevel === null) {
    currentLevel = new Experience();
    currentLevel.user = message.author.id;
    currentLevel.tag = message.author.tag;
    currentLevel.messages = 0;
    currentLevel.level = 0;
    currentLevel.experience = 0;
  }

  currentLevel.messages++;

  const experience = getExperienceFromMessage(message);
  const level = getLevelFromExperience(experience);

  currentLevel.experience += experience;

  if (level > currentLevel.level) {
    currentLevel.level++;

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
};
