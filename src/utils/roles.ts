import { logMessages } from "../translations/logs.js";
import { type Roles } from "../types/Roles.js";
import { type RoleSets } from "../types/RoleSets.js";
import { client } from "./client.js";
import { getConfigProperty, getFromRoleConfig } from "./config.js";
import { logger } from "./logger.js";
import { isNotNullish } from "./utils.js";
import { type Guild, type Role } from "discord.js";

const roles: {
  [K in Roles]?: Role | undefined;
} = {};

const roleSets: {
  [K in RoleSets]: Role[];
} = {
  color: [],
  courses: [],
  notification: [],
  program: [],
  year: [],
};

export const initializeRoles = async () => {
  const roleIds = await getConfigProperty("roles");
  const guild = client.guilds.cache.get(await getConfigProperty("guild"));

  if (roleIds === undefined || guild === undefined) {
    return;
  }

  for (const [roleName, roleId] of Object.entries(roleIds)) {
    if (roleId === undefined) {
      continue;
    }

    roles[roleName as Roles] = guild.roles.cache.get(roleId);
  }

  logger.info(logMessages.rolesInitialized);
};

export const refreshRoles = (guild: Guild, type: RoleSets) => {
  if (roleSets[type].length === 0) {
    const roleNames =
      type === "courses"
        ? Object.keys(getFromRoleConfig("courses"))
        : getFromRoleConfig(type);

    const roleSet = roleNames.map((roleName) =>
      guild.roles.cache.find((ro) => ro.name === roleName),
    );

    roleSets[type] = roleSet.filter((role) => role !== undefined) as Role[];
  }
};

export const getRole = (type: Roles) => roles[type];

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
  const courses = getFromRoleConfig("course")[semester];

  if (courses === undefined) {
    return [];
  }

  if (roleSets.courses.length === 0) {
    refreshRoles(guild, "courses");
  }

  return roleSets.courses.filter((role) => courses.includes(role.name));
};

export const getCourseRoleByCourseName = (guild: Guild, course: string) => {
  const roleName = Object.entries(getFromRoleConfig("courses")).find(
    ([, courseName]) => course === courseName,
  );

  if (roleName === undefined) {
    return null;
  }

  return guild.roles.cache.find((role) => role.name === roleName[0]) ?? null;
};

export const getMembersByRoles = async (
  guild: Guild,
  rolesWithMembers: Role[],
) => {
  await guild.members.fetch();
  await guild.roles.fetch();

  const members = rolesWithMembers.map((role) => role.members.keys());

  const uniqueMembers = new Set<string>();
  for (const iterator of members) {
    const ids = Array.from(iterator ?? []);

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
    .filter(isNotNullish);

  return await getMembersByRoles(guild, rolesList);
};

export const getMembersByRolesExtended = async (
  guild: Guild,
  rolesWithMembers: Role[],
  rolesWithoutMembers: Role[],
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
    .filter(isNotNullish);

  const rolesWithoutMembers = roleIdsWithoutMembers
    .map((role) => guild.roles.cache.get(role))
    .filter(isNotNullish);

  return await getMembersByRolesExtended(
    guild,
    rolesWithMembers,
    rolesWithoutMembers,
  );
};
