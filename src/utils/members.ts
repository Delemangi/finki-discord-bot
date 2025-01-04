import { client } from '../client.js';
import { getRolesProperty } from '../configuration/main.js';
import { getBarByUserId } from '../data/Bar.js';
import { getExperienceByUserId } from '../data/Experience.js';
import { Role } from '../lib/schemas/Role.js';
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

  const vipRoleId = await getRolesProperty(Role.VIP);
  const moderatorRoleId = await getRolesProperty(Role.Moderators);
  const adminRoleId = await getRolesProperty(Role.Administrators);

  return (
    (vipRoleId !== undefined && member.roles.cache.has(vipRoleId)) ||
    (moderatorRoleId !== undefined &&
      member.roles.cache.has(moderatorRoleId)) ||
    (adminRoleId !== undefined && member.roles.cache.has(adminRoleId))
  );
};

export const isMemberInCouncil = async (member: GuildMember) => {
  const councilRoleId = await getRolesProperty(Role.Council);

  return councilRoleId !== undefined && member.roles.cache.has(councilRoleId);
};

export const isMemberInIrregulars = async (member: GuildMember) => {
  const irregularRoleId = await getRolesProperty(Role.Irregulars);

  return (
    irregularRoleId !== undefined && member.roles.cache.has(irregularRoleId)
  );
};

export const isMemberInRegulars = async (member: GuildMember) => {
  const regularRoleId = await getRolesProperty(Role.Regulars);

  return regularRoleId !== undefined && member.roles.cache.has(regularRoleId);
};

export const isMemberAdmin = async (member: GuildMember) => {
  if (await isMemberAdministrator(member)) {
    return true;
  }

  const adminRoleId = await getRolesProperty(Role.Administrators);
  const moderatorRoleId = await getRolesProperty(Role.Moderators);

  return (
    (adminRoleId !== undefined && member.roles.cache.has(adminRoleId)) ||
    (moderatorRoleId !== undefined && member.roles.cache.has(moderatorRoleId))
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
