import { getBarByUserId } from '../data/Bar.js';
import { getExperienceByUserId } from '../data/Experience.js';
import { client } from './client.js';
import { getRoleProperty } from './config.js';
import { type GuildMember, PermissionsBitField } from 'discord.js';

export const getUsername = async (userId: string) => {
  const user = await client.users.fetch(userId);

  return user.tag;
};

export const isMemberAdministrator = async (member: GuildMember) => {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
};

export const isMemberInVip = async (member: GuildMember) => {
  if (await isMemberAdministrator(member)) {
    return true;
  }

  const vipRoleId = await getRoleProperty('vip');
  const moderatorRoleId = await getRoleProperty('moderator');
  const adminRoleId = await getRoleProperty('admin');
  const veteranRoleId = await getRoleProperty('veteran');

  return (
    member.roles.cache.has(vipRoleId) ||
    member.roles.cache.has(moderatorRoleId) ||
    member.roles.cache.has(adminRoleId) ||
    member.roles.cache.has(veteranRoleId)
  );
};

export const isMemberInCouncil = async (member: GuildMember) => {
  const councilRoleId = await getRoleProperty('council');

  return member.roles.cache.has(councilRoleId);
};

export const isMemberInvitedToVip = async (member: GuildMember) => {
  const regularRoleId = await getRoleProperty('regular');

  return member.roles.cache.has(regularRoleId);
};

export const isMemberAdmin = async (member: GuildMember) => {
  if (await isMemberAdministrator(member)) {
    return true;
  }

  const adminRoleId = await getRoleProperty('admin');
  const moderatorRoleId = await getRoleProperty('moderator');

  return (
    member.roles.cache.has(adminRoleId) ||
    member.roles.cache.has(moderatorRoleId)
  );
};

export const isMemberLevel = async (
  member: GuildMember,
  level: number,
  orAbove = true,
) => {
  const experience = await getExperienceByUserId(member.id);

  if (experience === null) {
    return false;
  }

  return orAbove ? experience.level >= level : experience.level === level;
};

export const isMemberBarred = async (userId: string) => {
  const bar = await getBarByUserId(userId);

  return bar !== null;
};
