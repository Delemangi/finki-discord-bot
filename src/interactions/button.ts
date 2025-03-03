import {
  type ButtonInteraction,
  ChannelType,
  type GuildMember,
  type GuildMemberRoleManager,
  MessageFlags,
  roleMention,
} from 'discord.js';

import { getRemindersComponents } from '../components/reminders.js';
import {
  getConfigProperty,
  getRolesProperty,
  getTicketingProperty,
  getTicketProperty,
} from '../configuration/main.js';
import {
  deleteReminder,
  getReminderById,
  getRemindersByUserId,
} from '../data/database/Reminder.js';
import { Channel } from '../lib/schemas/Channel.js';
import { PollType } from '../lib/schemas/PollType.js';
import { Role } from '../lib/schemas/Role.js';
import { logger } from '../logger.js';
import {
  commandErrorFunctions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from '../translations/commands.js';
import { logErrorFunctions } from '../translations/logs.js';
import {
  specialStringFunctions,
  specialStrings,
} from '../translations/special.js';
import { deleteResponse, getChannel } from '../utils/channels.js';
import { getGuild } from '../utils/guild.js';
import { COUNCIL_LEVEL, IRREGULARS_LEVEL, VIP_LEVEL } from '../utils/levels.js';
import {
  isMemberBarred,
  isMemberInIrregulars,
  isMemberInRegulars,
  isMemberInVip,
  isMemberLevel,
} from '../utils/members.js';
import { createPoll, isPollDuplicate } from '../utils/polls/main.js';
import { USER_ID_REGEX } from '../utils/regex.js';
import {
  getCourseRolesBySemester,
  getMembersByRoleIds,
  getRoleFromSet,
  getRoles,
} from '../utils/roles.js';
import { closeTicket, createTicket } from '../utils/tickets.js';

export const handleCourseButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      logErrorFunctions.invalidButtonInteractionError(interaction.customId),
    );

    return;
  }

  const role = getRoleFromSet(guild, 'courses', args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

  // @ts-expect-error The member cannot be null
  const memberRoles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (memberRoles.cache.has(role.id)) {
    await memberRoles.remove(role);
  } else {
    await memberRoles.add(role);
    removed = false;
  }

  try {
    const mess = await interaction.reply({
      allowedMentions: {
        parse: [],
      },
      content: commandResponseFunctions.courseAddedOrRemoved(role.id, removed),
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(logErrorFunctions.buttonInteractionResponseError(error));
  }
};

export const handleYearButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      logErrorFunctions.invalidButtonInteractionError(interaction.customId),
    );

    return;
  }

  const role = getRoleFromSet(guild, 'year', args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

  // @ts-expect-error The member cannot be null
  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(guild, 'year'));
    await roles.add(role);
    removed = false;
  }

  try {
    const mess = await interaction.reply({
      allowedMentions: {
        parse: [],
      },
      content: commandResponseFunctions.yearAddedOrRemoved(role.id, removed),
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(logErrorFunctions.buttonInteractionResponseError(error));
  }
};

export const handleProgramButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      logErrorFunctions.invalidButtonInteractionError(interaction.customId),
    );

    return;
  }

  const role = getRoleFromSet(guild, 'program', args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

  // @ts-expect-error The member cannot be null
  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(guild, 'program'));
    await roles.add(role);
    removed = false;
  }

  try {
    const mess = await interaction.reply({
      allowedMentions: {
        parse: [],
      },
      content: commandResponseFunctions.programAddedOrRemoved(role.id, removed),
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(logErrorFunctions.buttonInteractionResponseError(error));
  }
};

export const handleNotificationButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      logErrorFunctions.invalidButtonInteractionError(interaction.customId),
    );

    return;
  }

  const role = getRoleFromSet(guild, 'notification', args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

  // @ts-expect-error The member cannot be null
  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.add(role);
    removed = false;
  }

  try {
    const mess = await interaction.reply({
      allowedMentions: {
        parse: [],
      },
      content: commandResponseFunctions.notificationAddedOrRemoved(
        role.id,
        removed,
      ),
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(logErrorFunctions.buttonInteractionResponseError(error));
  }
};

export const handleColorButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      logErrorFunctions.invalidButtonInteractionError(interaction.customId),
    );

    return;
  }

  const role = getRoleFromSet(guild, 'color', args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

  // @ts-expect-error The member cannot be null
  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(guild, 'color'));
    await roles.add(role);
    removed = false;
  }

  try {
    const mess = await interaction.reply({
      allowedMentions: {
        parse: [],
      },
      content: commandResponseFunctions.colorAddedOrRemoved(role.id, removed),
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(logErrorFunctions.buttonInteractionResponseError(error));
  }
};

export const handleAddCoursesButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      logErrorFunctions.invalidButtonInteractionError(interaction.customId),
    );

    return;
  }

  const semester = Number(args[0]);
  const member = interaction.member as GuildMember;
  const roles =
    args[0] === 'all'
      ? getRoles(guild, 'courses')
      : getCourseRolesBySemester(guild, semester);

  await member.roles.add(roles);

  try {
    await interaction.editReply({
      content:
        args[0] === 'all'
          ? commandResponses.allCoursesAdded
          : commandResponseFunctions.semesterCoursesAdded(semester),
    });
  } catch (error) {
    logger.warn(logErrorFunctions.buttonInteractionResponseError(error));
  }
};

export const handleRemoveCoursesButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      logErrorFunctions.invalidButtonInteractionError(interaction.customId),
    );

    return;
  }

  const semester = Number(args[0]);
  const member = interaction.member as GuildMember;
  const roles =
    args[0] === 'all'
      ? getRoles(guild, 'courses')
      : getCourseRolesBySemester(guild, semester);

  await member.roles.remove(roles);

  try {
    await interaction.editReply({
      content:
        args[0] === 'all'
          ? commandResponses.allCoursesRemoved
          : commandResponseFunctions.semesterCoursesRemoved(semester),
    });
  } catch (error) {
    logger.warn(logErrorFunctions.buttonInteractionResponseError(error));
  }
};

export const handleVipButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const member = interaction.member as GuildMember;

  const vipRoleId = getRolesProperty(Role.VIP);
  const councilRoleId = getRolesProperty(Role.Council);

  if (args[0] === 'acknowledge') {
    if (
      interaction.user.id !==
      USER_ID_REGEX.exec(interaction.message.content)?.[0]
    ) {
      const resp = await interaction.reply({
        content: commandErrors.oathNoPermission,
        flags: MessageFlags.Ephemeral,
      });
      void deleteResponse(resp);

      return;
    }

    await interaction.deferUpdate();
    await interaction.message.delete();

    return;
  }

  if (args[0] === 'confirm') {
    if (
      interaction.user.id !==
      USER_ID_REGEX.exec(interaction.message.content)?.[0]
    ) {
      const resp = await interaction.reply({
        content: commandErrors.oathNoPermission,
        flags: MessageFlags.Ephemeral,
      });
      void deleteResponse(resp);

      return;
    }

    const vipChannel = getChannel(Channel.VIP);
    await vipChannel?.send(
      specialStringFunctions.vipWelcome(interaction.user.id),
    );

    if (vipRoleId === undefined) {
      await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.VIP));
      logger.warn(logErrorFunctions.roleNotFound(Role.VIP));
    } else {
      await member.roles.add(vipRoleId);
    }

    if (councilRoleId === undefined) {
      await vipChannel?.send(commandErrorFunctions.roleNotFound(Role.Council));
      logger.warn(logErrorFunctions.roleNotFound(Role.Council));
    } else if (await isMemberLevel(member, COUNCIL_LEVEL)) {
      await member.roles.add(councilRoleId);
    }

    const message = await interaction.reply({
      content: specialStringFunctions.vipWelcome(interaction.user.id),
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(message);

    await interaction.message.delete();

    return;
  }

  if (!getConfigProperty('oathEnabled')) {
    const message = await interaction.reply({
      content: specialStrings.requestsPaused,
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(message);

    return;
  }

  if (isMemberInVip(member)) {
    await interaction.reply({
      content: commandErrors.alreadyVipMember,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  if (await isMemberBarred(interaction.user.id)) {
    await interaction.reply({
      content: specialStrings.requestRejected,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  if (!(await isMemberLevel(member, VIP_LEVEL, true))) {
    const message = await interaction.reply({
      content: specialStrings.specialRequestUnderLevel,
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(message);

    return;
  }

  const isDuplicate = await isPollDuplicate(
    PollType.VIP_REQUEST,
    interaction.user.id,
  );

  if (isDuplicate) {
    const message = await interaction.reply({
      content: specialStrings.requestActive,
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(message);

    return;
  }

  const poll = createPoll(PollType.VIP_REQUEST, interaction.user);

  const councilChannel = getChannel(Channel.Council);
  await councilChannel?.send(poll);

  if (councilRoleId !== undefined) {
    await councilChannel?.send(roleMention(councilRoleId));
  }

  await interaction.reply({
    content: specialStrings.requestSent,
    flags: MessageFlags.Ephemeral,
  });
};

export const handleIrregularsButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const member = interaction.member as GuildMember;

  if (isMemberInIrregulars(member)) {
    await interaction.reply({
      content: commandErrors.alreadyIrregular,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  if (await isMemberBarred(interaction.user.id)) {
    await interaction.reply({
      content: specialStrings.requestRejected,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  if (!isMemberInRegulars(member)) {
    await interaction.reply({
      content: specialStrings.requestRejected,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const irregularsRoleId = getRolesProperty(Role.Irregulars);
  const councilRoleId = getRolesProperty(Role.Council);

  if (args[0] === 'acknowledge') {
    if (
      interaction.user.id !==
      USER_ID_REGEX.exec(interaction.message.content)?.[0]
    ) {
      const resp = await interaction.reply({
        content: commandErrors.oathNoPermission,
        flags: MessageFlags.Ephemeral,
      });
      void deleteResponse(resp);

      return;
    }

    await interaction.deferUpdate();
    await interaction.message.delete();

    return;
  }

  if (args[0] === 'confirm') {
    if (
      interaction.user.id !==
      USER_ID_REGEX.exec(interaction.message.content)?.[0]
    ) {
      const resp = await interaction.reply({
        content: commandErrors.oathNoPermission,
        flags: MessageFlags.Ephemeral,
      });
      void deleteResponse(resp);

      return;
    }

    const irregularsChannel = getChannel(Channel.Irregulars);
    await irregularsChannel?.send(
      specialStringFunctions.irregularsWelcome(interaction.user.id),
    );

    if (irregularsRoleId === undefined) {
      await irregularsChannel?.send(
        commandErrorFunctions.roleNotFound(Role.Irregulars),
      );
      logger.warn(logErrorFunctions.roleNotFound(Role.Irregulars));
    } else {
      await member.roles.add(irregularsRoleId);
    }

    const message = await interaction.reply({
      content: specialStringFunctions.irregularsWelcome(interaction.user.id),
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(message);

    await interaction.message.delete();

    return;
  }

  if (!getConfigProperty('oathEnabled')) {
    const message = await interaction.reply({
      content: specialStrings.requestsPaused,
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(message);

    return;
  }

  if (!(await isMemberLevel(member, IRREGULARS_LEVEL, true))) {
    const message = await interaction.reply({
      content: specialStrings.specialRequestUnderLevel,
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(message);

    return;
  }

  const isDuplicate = await isPollDuplicate(
    PollType.IRREGULARS_REQUEST,
    interaction.user.id,
  );

  if (isDuplicate) {
    const message = await interaction.reply({
      content: specialStrings.requestActive,
      flags: MessageFlags.Ephemeral,
    });
    void deleteResponse(message);

    return;
  }

  const poll = createPoll(PollType.IRREGULARS_REQUEST, interaction.user);

  const councilChannel = getChannel(Channel.Council);
  await councilChannel?.send(poll);

  if (councilRoleId !== undefined) {
    await councilChannel?.send(roleMention(councilRoleId));
  }

  await interaction.reply({
    content: specialStrings.requestSent,
    flags: MessageFlags.Ephemeral,
  });
};

export const handleReminderDeleteButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const [reminderId, authorId] = args;

  if (reminderId === undefined || authorId === undefined) {
    await interaction.reply({
      content: commandErrors.commandError,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const reminder = await getReminderById(reminderId);

  if (authorId !== interaction.user.id) {
    await interaction.reply({
      content: commandErrors.reminderNoPermission,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  if (reminder === null) {
    const newReminders = await getRemindersByUserId(authorId);
    const newComponents = getRemindersComponents(newReminders ?? []);

    await interaction.message.edit({
      components: newComponents,
    });

    return;
  }

  if (reminder.userId !== interaction.user.id) {
    return;
  }

  await deleteReminder(reminderId);

  await interaction.reply({
    content: commandResponses.reminderDeleted,
    flags: MessageFlags.Ephemeral,
  });

  const reminders = await getRemindersByUserId(interaction.user.id);
  const components = getRemindersComponents(reminders ?? []);
  await interaction.message.edit({
    components,
  });
};

export const handleTicketCreateButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);
  const ticketType = args[0];

  const enabled = getTicketingProperty('enabled');

  if (!enabled) {
    await interaction.editReply(commandErrors.ticketingDisabled);
  }

  if (ticketType === undefined) {
    await interaction.editReply(commandErrors.invalidTicketType);

    return;
  }

  const ticketMetadata = getTicketProperty(ticketType);

  if (ticketMetadata === undefined) {
    await interaction.editReply(commandErrors.invalidTicketType);

    return;
  }

  if (guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  const ticketsChannel = getChannel(Channel.Tickets);

  if (
    ticketsChannel === undefined ||
    ticketsChannel.type !== ChannelType.GuildText
  ) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  if (ticketMetadata.roles.length === 0) {
    await interaction.editReply(commandErrors.noTicketMembers);

    return;
  }

  const ticketRoleMembers = await getMembersByRoleIds(
    guild,
    ticketMetadata.roles,
  );

  if (ticketRoleMembers.length === 0) {
    await interaction.editReply(commandErrors.noTicketMembers);

    return;
  }

  await createTicket(interaction, ticketMetadata);
};

export const handleTicketCloseButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const ticketId = args[0];

  if (ticketId === undefined) {
    await interaction.reply(commandErrors.invalidTicket);

    return;
  }

  await closeTicket(ticketId);
  await interaction.deferUpdate();
};
