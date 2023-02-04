import { getFromRoleConfig } from './config.js';
import {
  type Guild,
  type Role
} from 'discord.js';

const roles: { [K in RoleSets]: Role[] } = {
  activity: [],
  color: [],
  courses: [],
  notification: [],
  program: [],
  year: []
};

export function refreshRoles (guild: Guild | null, type: RoleSets) {
  if (roles[type].length === 0 && guild !== null) {
    let list;

    if (type === 'courses') {
      list = Object.keys(getFromRoleConfig('courses'));
    } else {
      list = getFromRoleConfig(type);
    }

    list = list.map((role) => guild?.roles.cache.find((r) => r.name === role));

    if (!list.includes(undefined)) {
      roles[type] = list as Role[];
    }
  }
}

export function getRole (guild: Guild | null, type: RoleSets, role?: string) {
  if (role === undefined) {
    return undefined;
  }

  if (roles[type].length === 0 && guild !== null) {
    refreshRoles(guild, type);
  }

  return roles[type].find((r) => r.name === role);
}

export function getRoles (guild: Guild | null, type: RoleSets) {
  if (roles[type].length === 0) {
    refreshRoles(guild, type);
  }

  return roles[type];
}
