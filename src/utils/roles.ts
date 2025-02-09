import { type Role as DiscordRole, type Guild } from 'discord.js';

import { getFromRoleConfig } from '../configuration/files.js';
import { getConfigProperty } from '../configuration/main.js';
import { type Role as RoleName } from '../lib/schemas/Role.js';
import { type RoleSets } from '../lib/types/RoleSets.js';
import { logger } from '../logger.js';
import { logErrorFunctions, logMessages } from '../translations/logs.js';
import { getGuild } from './guild.js';

const roles: Partial<Record<RoleName, DiscordRole | undefined>> = {};
const roleSets: Record<RoleSets, DiscordRole[]> = {
  color: [],
  courses: [],
  notification: [],
  program: [],
  year: [],
};

export const initializeRoles = async () => {
  const roleIds = getConfigProperty('roles');
  const guild = await getGuild();

  if (roleIds === undefined || guild === null) {
    return;
  }

  for (const [roleName, roleId] of Object.entries(roleIds)) {
    try {
      const role = await guild.roles.fetch(roleId);
      roles[roleName as RoleName] = role ?? undefined;
    } catch (error) {
      logger.error(logErrorFunctions.roleFetchError(roleId, error));
    }
  }

  logger.info(logMessages.rolesInitialized);
};

export const refreshRoles = (guild: Guild, type: RoleSets) => {
  if (roleSets[type].length === 0) {
    const roleNames =
      type === 'courses'
        ? Object.keys(getFromRoleConfig('courses'))
        : getFromRoleConfig(type);

    const roleSet = roleNames.map((roleName) =>
      guild.roles.cache.find((role) => role.name === roleName),
    );

    roleSets[type] = roleSet.filter((role) => role !== undefined);
  }
};

export const getRole = (type: RoleName) => roles[type];

export const getRoleFromSet = (guild: Guild, type: RoleSets, role: string) => {
  if (roleSets[type].length === 0) {
    refreshRoles(guild, type);
  }

  return roleSets[type].find((ro) => ro.name === role);
};

export const getRoles = (guild: Guild, type: RoleSets) => {
  if (roleSets[type].length === 0) {
    refreshRoles(guild, type);
  }

  return roleSets[type];
};

export const getCourseRolesBySemester = (guild: Guild, semester: number) => {
  const courses = getFromRoleConfig('course')[semester];

  if (courses === undefined) {
    return [];
  }

  if (roleSets.courses.length === 0) {
    refreshRoles(guild, 'courses');
  }

  return roleSets.courses.filter((role) => courses.includes(role.name));
};

export const getCourseRoleByCourseName = (guild: Guild, course: string) => {
  const roleName = Object.entries(getFromRoleConfig('courses')).find(
    ([, courseName]) => course === courseName,
  );

  if (roleName === undefined) {
    return null;
  }

  return guild.roles.cache.find((role) => role.name === roleName[0]) ?? null;
};

export const getMembersByRoles = async (
  guild: Guild,
  rolesWithMembers: DiscordRole[],
) => {
  await guild.members.fetch();
  await guild.roles.fetch();

  const members = rolesWithMembers.map((role) => role.members.keys());

  const uniqueMembers = new Set<string>();
  for (const iterator of members) {
    const ids = Array.from(iterator);

    for (const id of ids) {
      uniqueMembers.add(id);
    }
  }

  return Array.from(uniqueMembers);
};

export const getMembersByRoleIds = async (
  guild: Guild,
  roleIdsWithMembers: string[],
) => {
  const rolesList = roleIdsWithMembers
    .map((role) => guild.roles.cache.get(role))
    .filter((role) => role !== undefined);

  return await getMembersByRoles(guild, rolesList);
};

export const getMembersByRolesExtended = async (
  guild: Guild,
  rolesWithMembers: DiscordRole[],
  rolesWithoutMembers: DiscordRole[],
) => {
  await guild.members.fetch();
  await guild.roles.fetch();

  const uniqueMembers = new Set<string>();

  const members = rolesWithMembers.map((role) => role.members.keys());

  for (const iterator of members) {
    const ids = Array.from(iterator);

    for (const id of ids) {
      uniqueMembers.add(id);
    }
  }

  const membersWithout = rolesWithoutMembers.map((role) => role.members.keys());

  for (const iterator of membersWithout) {
    const ids = Array.from(iterator);

    for (const id of ids) {
      uniqueMembers.delete(id);
    }
  }

  return Array.from(uniqueMembers);
};

export const getMembersByRoleIdsExtended = async (
  guild: Guild,
  roleIdsWithMembers: string[],
  roleIdsWithoutMembers: string[],
) => {
  const rolesWithMembers = roleIdsWithMembers
    .map((role) => guild.roles.cache.get(role))
    .filter((role) => role !== undefined);

  const rolesWithoutMembers = roleIdsWithoutMembers
    .map((role) => guild.roles.cache.get(role))
    .filter((role) => role !== undefined);

  return await getMembersByRolesExtended(
    guild,
    rolesWithMembers,
    rolesWithoutMembers,
  );
};
