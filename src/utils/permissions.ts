import { commandDescriptions } from "../translations/commands.js";
import { type Roles } from "../types/Roles.js";
import { getRoleProperty } from "./config.js";
import { isMemberAdministrator } from "./members.js";
import { type GuildMember, PermissionsBitField } from "discord.js";

const commandPermissions: Record<
  string,
  {
    permissions: bigint[];
    roles: Roles[];
  }
> = {
  config: {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  "council add": {
    permissions: [],
    roles: ["council"],
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
    roles: ["admin", "moderator", "fss"],
  },
  "members barred": {
    permissions: [],
    roles: ["admin", "moderator", "vip"],
  },
  "members invited": {
    permissions: [],
    roles: ["admin", "moderator", "vip"],
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
  regulars: {
    permissions: [],
    roles: ["admin", "moderator"],
  },
  script: {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  "special bar": {
    permissions: [],
    roles: ["council"],
  },
  "special delete": {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  "special list": {
    permissions: [],
    roles: ["admin", "moderator", "vip"],
  },
  "special override": {
    permissions: [PermissionsBitField.Flags.Administrator],
    roles: [],
  },
  "special remaining": {
    permissions: [],
    roles: ["council"],
  },
  "special unbar": {
    permissions: [],
    roles: ["council"],
  },
  "vip add": {
    permissions: [],
    roles: ["council"],
  },
  "vip recreate": {
    permissions: [],
    roles: ["admin", "moderator"],
  },
  "vip remove": {
    permissions: [],
    roles: ["council"],
  },
};

const getCommandPermission = async (
  command: string,
): Promise<[bigint[], string[]]> => {
  const topCommand = command.split(" ")[0];

  if (Object.keys(commandPermissions).includes(command)) {
    return [
      commandPermissions[command]?.permissions ?? [],
      await Promise.all(
        commandPermissions[command]?.roles.map(
          async (role) => await getRoleProperty(role),
        ) ?? [],
      ),
    ];
  } else if (
    topCommand !== undefined &&
    Object.keys(commandPermissions).includes(topCommand)
  ) {
    return [
      commandPermissions[topCommand]?.permissions ?? [],
      await Promise.all(
        commandPermissions[topCommand]?.roles.map(
          async (role) => await getRoleProperty(role),
        ) ?? [],
      ),
    ];
  } else {
    return [[], []];
  }
};

// Check whether the member has all the command permissions, or any of the roles
export const hasCommandPermission = async (
  member: GuildMember,
  command: string,
) => {
  if (await isMemberAdministrator(member)) {
    return true;
  }

  const [permissions, roles] = await getCommandPermission(command);

  if (permissions.length === 0 && roles.length === 0) {
    return true;
  }

  return (
    (permissions.length !== 0 && member.permissions.has(permissions)) ||
    (roles.length !== 0 && member.roles.cache.hasAny(...roles))
  );
};

export const getCommandsWithPermission = async (member: GuildMember) => {
  const commands = await Promise.all(
    Object.keys(commandDescriptions).map(
      async (command) => await hasCommandPermission(member, command),
    ),
  );

  return Object.keys(commandDescriptions).filter((_, index) => commands[index]);
};
