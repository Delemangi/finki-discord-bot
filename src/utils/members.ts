import { type GuildMember, PermissionsBitField } from 'discord.js';

import { client } from '../client.js';
import { getRolesProperty } from '../configuration/main.js';
import { getBarByUserId } from '../data/database/Bar.js';
import { getExperienceByUserId } from '../data/database/Experience.js';
import { Role } from '../lib/schemas/Role.js';

export const getUsername = async (userId: string) => {
  const user = await client.users.fetch(userId);

  return user.tag;
};

export const isMemberAdministrator = (member: GuildMember) =>
  member.permissions.has(PermissionsBitField.Flags.Administrator);

export const isMemberInVip = (member: GuildMember) => {
  if (isMemberAdministrator(member)) {
    return true;
  }

  const vipRoleId = getRolesProperty(Role.VIP);
  const moderatorRoleId = getRolesProperty(Role.Moderators);
  const adminRoleId = getRolesProperty(Role.Administrators);

  return (
    (vipRoleId !== undefined && member.roles.cache.has(vipRoleId)) ||
    (moderatorRoleId !== undefined &&
      member.roles.cache.has(moderatorRoleId)) ||
    (adminRoleId !== undefined && member.roles.cache.has(adminRoleId))
  );
};

export const isMemberInCouncil = (member: GuildMember) => {
  const councilRoleId = getRolesProperty(Role.Council);

  return councilRoleId !== undefined && member.roles.cache.has(councilRoleId);
};

export const isMemberInIrregulars = (member: GuildMember) => {
  const irregularRoleId = getRolesProperty(Role.Irregulars);

  return (
    irregularRoleId !== undefined && member.roles.cache.has(irregularRoleId)
  );
};

export const isMemberInRegulars = (member: GuildMember) => {
  const regularRoleId = getRolesProperty(Role.Regulars);

  return regularRoleId !== undefined && member.roles.cache.has(regularRoleId);
};

export const isMemberAdmin = (member: GuildMember) => {
  if (isMemberAdministrator(member)) {
    return true;
  }

  const adminRoleId = getRolesProperty(Role.Administrators);
  const moderatorRoleId = getRolesProperty(Role.Moderators);

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
