import { createExperience, getExperienceByUserId } from '../data/Experience.js';
import { type ClientEvents, Events } from 'discord.js';

export const name = Events.GuildMemberAdd;

export const execute = async (...[member]: ClientEvents[typeof name]) => {
  const experience = await getExperienceByUserId(member.id);

  if (experience === null) {
    await createExperience({
      experience: 0n,
      lastMessage: new Date(),
      level: 0,
      messages: 0,
      userId: member.id,
    });
  }
};
