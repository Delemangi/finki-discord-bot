import { Experience } from '../entities/Experience.js';
import { getExperienceByUserId, saveExperience } from '../utils/database.js';
import { type ClientEvents, Events } from 'discord.js';

export const name = Events.GuildMemberAdd;

export const execute = async (...args: ClientEvents[typeof name]) => {
  const member = args[0];

  const experience = getExperienceByUserId(member.id);

  if (experience === null) {
    const exp = new Experience();
    exp.user = member.id;
    exp.tag = member.user.tag;
    exp.messages = 0;
    exp.experience = 0n;
    exp.level = 0;

    await saveExperience(exp);
  }
};
