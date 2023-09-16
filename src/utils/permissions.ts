import { type Roles } from "../types/Roles.js";
import { logger } from "./logger.js";
import { getRole } from "./roles.js";
import { commandDescriptions } from "./strings.js";
import { type GuildMember, PermissionsBitField } from "discord.js";

const commandPermissions: {
  [key: string]: {
    permissions: bigint[];
    roles: Roles[];
  };
} = {
  config: {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  embed: {
    permissions: [PermissionsBitField.Flags.ManageMessages],
    roles: [],
  },
  "experience add": {
    permissions: [],
    roles: ["admin"],
  },
  manage: {
    permissions: [],
    roles: ["admin", "fss"],
  },
  message: {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  "poll delete": {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  purge: {
    permissions: [PermissionsBitField.Flags.ManageMessages],
    roles: [],
  },
  register: {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  script: {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  "vip add": {
    permissions: [],
    roles: ["vipVoting"],
  },
  "vip ban": {
    permissions: [],
    roles: ["vipVoting"],
  },
  "vip bans": {
    permissions: [],
    roles: ["vip"],
  },
  "vip delete": {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  "vip invite": {
    permissions: [],
    roles: ["admin"],
  },
  "vip invited": {
    permissions: [],
    roles: ["vip"],
  },
  "vip list": {
    permissions: [],
    roles: ["vipVoting"],
  },
  "vip override": {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  "vip remaining": {
    permissions: [],
    roles: ["vipVoting"],
  },
  "vip remove": {
    permissions: [],
    roles: ["vipVoting"],
  },
  "vip unban": {
    permissions: [],
    roles: ["vipVoting"],
  },
  "vip upgrade": {
    permissions: [],
    roles: ["vipVoting"],
  },
};

const getCommandPermission = (
  command: string
): [bigint[], Array<string | undefined>] => {
  const topCommand = command.split(" ")[0];

  if (Object.keys(commandPermissions).includes(command)) {
    return [
      commandPermissions[command]?.permissions ?? [],
      commandPermissions[command]?.roles.map((role) => getRole(role)?.id) ?? [],
    ];
  } else if (
    topCommand !== undefined &&
    Object.keys(commandPermissions).includes(topCommand)
  ) {
    return [
      commandPermissions[topCommand]?.permissions ?? [],
      commandPermissions[topCommand]?.roles.map((role) => getRole(role)?.id) ??
        [],
    ];
  } else {
    return [[], []];
  }
};

// Check whether the member has all the command permissions, or any of the roles
export const hasCommandPermission = (
  member: GuildMember | null,
  command: string
) => {
  if (member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
    (permissions.length !== 0 && member?.permissions.has(permissions)) ||
    (tidiedRoles.length !== 0 && member?.roles.cache.hasAny(...tidiedRoles))
  );
};

export const getCommandsWithPermission = (member: GuildMember | null) => {
  return Object.keys(commandDescriptions).filter((command) =>
    hasCommandPermission(member, command)
  );
};
