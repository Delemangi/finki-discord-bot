import { type GuildMember, type Poll } from 'discord.js';

import {
  getIrregularsAcknowledgeComponents,
  getIrregularsConfirmComponents,
  getIrregularsConfirmEmbed,
  getVipAcknowledgeComponents,
  getVipConfirmComponents,
  getVipConfirmEmbed,
} from '../../components/scripts.js';
import { getRolesProperty } from '../../configuration/main.js';
import { createBar, deleteBar } from '../../data/Bar.js';
import { Channel } from '../../lib/schemas/Channel.js';
import { PollType } from '../../lib/schemas/PollType.js';
import { Role } from '../../lib/schemas/Role.js';
import { logger } from '../../logger.js';
import { commandErrorFunctions } from '../../translations/commands.js';
import { labels } from '../../translations/labels.js';
import { logErrorFunctions } from '../../translations/logs.js';
import { specialStringFunctions } from '../../translations/special.js';
import { getChannel } from '../channels.js';
import { getMemberFromGuild } from '../guild.js';
import { getPollInformation } from './main.js';

const executeVipRequestPollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const vipChannel = getChannel(Channel.VIP);
  const oathChannel = getChannel(Channel.Oath);

  if (decision !== labels.yes) {
    const rejectComponents = getVipAcknowledgeComponents();
    await oathChannel?.send({
      components: rejectComponents,
      content: specialStringFunctions.vipRequestRejected(member.user.id),
    });

    await vipChannel?.send(
      specialStringFunctions.vipAddRejected(member.user.id),
    );

    return;
  }

  const confirmEmbed = getVipConfirmEmbed();
  const confirmComponents = getVipConfirmComponents();
  await oathChannel?.send({
    components: confirmComponents,
    content: specialStringFunctions.vipRequestAccepted(member.user.id),
    embeds: [confirmEmbed],
  });

  await vipChannel?.send(specialStringFunctions.vipAddAccepted(member.user.id));
};

const executeVipAddPollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const vipChannel = getChannel(Channel.VIP);
  const oathChannel = getChannel(Channel.Oath);

  if (decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.vipAddRejected(member.user.id),
    );

    return;
  }

  const confirmEmbed = getVipConfirmEmbed();
  const confirmComponents = getVipConfirmComponents();
  await oathChannel?.send({
    components: confirmComponents,
    content: specialStringFunctions.vipAddRequestAccepted(member.user.id),
    embeds: [confirmEmbed],
  });

  await vipChannel?.send(specialStringFunctions.vipAddAccepted(member.user.id));
};

const executeVipRemovePollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const vipChannel = getChannel(Channel.VIP);

  if (decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.vipRemoveRejected(member.user.id),
    );

    return;
  }

  const vipRoleId = getRolesProperty(Role.VIP);
  const councilRoleId = getRolesProperty(Role.Council);

  if (vipRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.VIP));
    logger.warn(logErrorFunctions.roleNotFound(Role.VIP));
  } else {
    await member.roles.remove(vipRoleId);
  }

  if (councilRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.Council));
    logger.warn(logErrorFunctions.roleNotFound(Role.Council));
  } else {
    await member.roles.remove(councilRoleId);
  }

  await vipChannel?.send(
    specialStringFunctions.vipRemoveAccepted(member.user.id),
  );
};

const executeCouncilAddPollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const vipChannel = getChannel(Channel.VIP);

  if (decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.councilAddRejected(member.user.id),
    );

    return;
  }

  const councilRoleId = getRolesProperty(Role.Council);

  if (councilRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.Council));
    logger.warn(logErrorFunctions.roleNotFound(Role.Council));
  } else {
    await member.roles.add(councilRoleId);
  }

  await vipChannel?.send(
    specialStringFunctions.councilAddAccepted(member.user.id),
  );
};

const executeCouncilRemovePollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const vipChannel = getChannel(Channel.VIP);

  if (decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.councilRemoveRejected(member.user.id),
    );

    return;
  }

  const councilRoleId = getRolesProperty(Role.Council);

  if (councilRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.Council));
    logger.warn(logErrorFunctions.roleNotFound(Role.Council));
  } else {
    await member.roles.remove(councilRoleId);
  }

  await vipChannel?.send(
    specialStringFunctions.councilRemoveAccepted(member.user.id),
  );
};

const executeAdminAddPollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const vipChannel = getChannel(Channel.VIP);

  if (decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.adminAddRejected(member.user.id),
    );

    return;
  }

  const adminsRoleId = getRolesProperty(Role.Administrators);
  const moderatorRoleId = getRolesProperty(Role.Moderators);

  if (adminsRoleId === undefined) {
    await vipChannel?.send(
      commandErrorFunctions.roleNotFound(Role.Administrators),
    );
    logger.warn(logErrorFunctions.roleNotFound(Role.Administrators));
  } else {
    await member.roles.add(adminsRoleId);
  }

  if (moderatorRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.Moderators));
    logger.warn(logErrorFunctions.roleNotFound(Role.Moderators));
  } else {
    await member.roles.add(moderatorRoleId);
  }

  await vipChannel?.send(
    specialStringFunctions.adminAddAccepted(member.user.id),
  );
};

const executeAdminRemovePollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const vipChannel = getChannel(Channel.VIP);

  if (decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.adminRemoveRejected(member.user.id),
    );

    return;
  }

  const adminsRoleId = getRolesProperty(Role.Administrators);
  const moderatorRoleId = getRolesProperty(Role.Moderators);

  if (adminsRoleId === undefined) {
    await vipChannel?.send(
      commandErrorFunctions.roleNotFound(Role.Administrators),
    );
    logger.warn(logErrorFunctions.roleNotFound(Role.Administrators));
  } else {
    await member.roles.remove(adminsRoleId);
  }

  if (moderatorRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.Moderators));
    logger.warn(logErrorFunctions.roleNotFound(Role.Moderators));
  } else {
    await member.roles.remove(moderatorRoleId);
  }

  await vipChannel?.send(
    specialStringFunctions.adminRemoveAccepted(member.user.id),
  );
};

const executeBarPollAction = async (member: GuildMember, decision: string) => {
  const vipChannel = getChannel(Channel.VIP);

  if (decision !== labels.yes) {
    await vipChannel?.send(specialStringFunctions.barRejected(member.user.id));

    return;
  }

  await createBar({
    userId: member.user.id,
  });

  const regularsRoleId = getRolesProperty(Role.Regulars);
  const vipRoleId = getRolesProperty(Role.VIP);
  const councilRoleId = getRolesProperty(Role.Council);

  if (regularsRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.Regulars));
    logger.warn(logErrorFunctions.roleNotFound(Role.Regulars));
  } else {
    await member.roles.remove(regularsRoleId);
  }

  if (vipRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.VIP));
    logger.warn(logErrorFunctions.roleNotFound(Role.VIP));
  } else {
    await member.roles.remove(vipRoleId);
  }

  if (councilRoleId === undefined) {
    await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.Council));
    logger.warn(logErrorFunctions.roleNotFound(Role.Council));
  } else {
    await member.roles.remove(councilRoleId);
  }

  await vipChannel?.send(specialStringFunctions.barAccepted(member.user.id));
};

const executeUnbarPollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const vipChannel = getChannel(Channel.VIP);

  if (decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.unbarRejected(member.user.id),
    );

    return;
  }

  await deleteBar(member.user.id);

  await vipChannel?.send(specialStringFunctions.unbarAccepted(member.user.id));
};

const executeIrregularsRequestPollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const irregularsChannel = getChannel(Channel.Irregulars);
  const oathChannel = getChannel(Channel.Oath);

  if (decision !== labels.yes) {
    const rejectComponents = getIrregularsAcknowledgeComponents();
    await oathChannel?.send({
      components: rejectComponents,
      content: specialStringFunctions.irregularsRequestRejected(member.user.id),
    });

    await irregularsChannel?.send(
      specialStringFunctions.irregularsAddRejected(member.user.id),
    );

    return;
  }

  const confirmEmbed = getIrregularsConfirmEmbed();
  const confirmComponents = getIrregularsConfirmComponents();
  await oathChannel?.send({
    components: confirmComponents,
    content: specialStringFunctions.irregularsRequestAccepted(member.user.id),
    embeds: [confirmEmbed],
  });

  await irregularsChannel?.send(
    specialStringFunctions.irregularsAddAccepted(member.user.id),
  );
};

const executeIrregularsAddPollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const irregularsChannel = getChannel(Channel.Irregulars);
  const oathChannel = getChannel(Channel.Oath);

  if (decision !== labels.yes) {
    await irregularsChannel?.send(
      specialStringFunctions.irregularsAddRejected(member.user.id),
    );

    return;
  }

  const confirmEmbed = getIrregularsConfirmEmbed();
  const confirmComponents = getIrregularsConfirmComponents();
  await oathChannel?.send({
    components: confirmComponents,
    content: specialStringFunctions.irregularsAddRequestAccepted(
      member.user.id,
    ),
    embeds: [confirmEmbed],
  });

  await irregularsChannel?.send(
    specialStringFunctions.irregularsAddAccepted(member.user.id),
  );
};

const executeIrregularsRemovePollAction = async (
  member: GuildMember,
  decision: string,
) => {
  const irregularsChannel = getChannel(Channel.Irregulars);

  if (decision !== labels.yes) {
    await irregularsChannel?.send(
      specialStringFunctions.irregularsRemoveRejected(member.user.id),
    );

    return;
  }

  const irregularsRoleId = getRolesProperty(Role.Irregulars);

  if (irregularsRoleId === undefined) {
    await irregularsChannel?.send(
      commandErrorFunctions.roleNotFound(Role.Irregulars),
    );
    logger.warn(logErrorFunctions.roleNotFound(Role.Irregulars));
  } else {
    await member.roles.remove(irregularsRoleId);
  }

  await irregularsChannel?.send(
    specialStringFunctions.irregularsRemoveAccepted(member.user.id),
  );
};

export const POLL_ACTIONS: Record<
  PollType,
  (member: GuildMember, decision: string) => Promise<void>
> = {
  [PollType.ADMIN_ADD]: executeAdminAddPollAction,
  [PollType.ADMIN_REMOVE]: executeAdminRemovePollAction,
  [PollType.BAR]: executeBarPollAction,
  [PollType.COUNCIL_ADD]: executeCouncilAddPollAction,
  [PollType.COUNCIL_REMOVE]: executeCouncilRemovePollAction,
  [PollType.IRREGULARS_ADD]: executeIrregularsAddPollAction,
  [PollType.IRREGULARS_REMOVE]: executeIrregularsRemovePollAction,
  [PollType.IRREGULARS_REQUEST]: executeIrregularsRequestPollAction,
  [PollType.UNBAR]: executeUnbarPollAction,
  [PollType.VIP_ADD]: executeVipAddPollAction,
  [PollType.VIP_REMOVE]: executeVipRemovePollAction,
  [PollType.VIP_REQUEST]: executeVipRequestPollAction,
} as const;

export const executePollAction = async (poll: Poll, decision: string) => {
  const { pollType, userId } = getPollInformation(poll.message.content);

  if (pollType === null || userId === null) {
    logger.warn(
      logErrorFunctions.pollNotExecutedError(
        pollType ?? labels.unknown,
        userId ?? labels.unknown,
      ),
    );

    return;
  }

  const member = await getMemberFromGuild(userId);

  if (member === null) {
    logger.warn(logErrorFunctions.memberNotFound(userId));
    return;
  }

  await POLL_ACTIONS[pollType](member, decision);
};
