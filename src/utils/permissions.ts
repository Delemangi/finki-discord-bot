import { logger } from './logger.js';
import { getRole } from './roles.js';
import { commandDescriptions } from './strings.js';
import { type GuildMember, PermissionsBitField } from 'discord.js';

const commandPermissions: {
  [key: string]: {
    permissions: bigint[];
    roles: string[];
  };
} = {
  crosspost: {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  embed: { permissions: [PermissionsBitField.Flags.ManageMessages], roles: [] },
  'experience add': {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  'poll delete': {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  purge: { permissions: [PermissionsBitField.Flags.ManageMessages], roles: [] },
  register: {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  script: { permissions: [PermissionsBitField.Flags.Administrator], roles: [] },
  'vip add': {
    permissions: [],
    roles: ['vip'],
  },
  'vip delete': {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  'vip override': {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  'vip remove': {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
};

const getCommandPermission = (
  command: string,
): [bigint[], Array<string | undefined>] => {
  const topCommand = command.split(' ')[0];

  if (Object.keys(commandDescriptions).includes(command)) {
    return [
      commandPermissions[command]?.permissions ?? [],
      commandPermissions[command]?.roles.map(
        (role) => getRole(role as Roles)?.id,
      ) ?? [],
    ];
  } else if (
    topCommand !== undefined &&
    Object.keys(commandDescriptions).includes(topCommand)
  ) {
    return [
      commandPermissions[topCommand]?.permissions ?? [],
      commandPermissions[topCommand]?.roles.map(
        (role) => getRole(role as Roles)?.id,
      ) ?? [],
    ];
  } else {
    return [[], []];
  }
};

export const hasCommandPermission = (
  member: GuildMember | null,
  command: string,
) => {
  if (member === null) {
    return true;
  }

  const [permissions, roles] = getCommandPermission(command);

  if (permissions.length === 0 && roles.length === 0) {
    return true;
  }

  if (roles.includes(undefined)) {
    logger.warn(`Found undefined roles in command permissions for ${command}`);
  }

  const tidiedRoles = roles.filter(Boolean) as string[];

  return (
    member.permissions.has(permissions) ||
    (tidiedRoles.length !== 0 && member.roles.cache.hasAll(...tidiedRoles))
  );
};

export const getCommandsWithPermission = (member: GuildMember | null) => {
  return Object.keys(commandDescriptions).filter((command) =>
    hasCommandPermission(member, command),
  );
};
