import {
  getPollComponents,
  getPollEmbed,
  getPollInfoEmbed,
  getPollStatsComponents,
} from '../components/polls.js';
import { getRemindersComponents } from '../components/reminders.js';
import {
  getVipAcknowledgeComponents,
  getVipConfirmComponents,
  getVipConfirmEmbed,
} from '../components/scripts.js';
import { getTicketCloseComponents } from '../components/tickets.js';
import { createBar, deleteBar } from '../data/Bar.js';
import { getPollById } from '../data/Poll.js';
import { getPollOptionById } from '../data/PollOption.js';
import {
  createPollVote,
  deletePollVote,
  getPollVotesByOptionId,
  getPollVotesByPollIdAndUserId,
} from '../data/PollVote.js';
import {
  deleteReminder,
  getReminderById,
  getRemindersByUserId,
} from '../data/Reminder.js';
import {
  deleteSpecialPoll,
  getSpecialPollByPollId,
  getSpecialPollByUserAndType,
} from '../data/SpecialPoll.js';
import {
  commandErrorFunctions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from '../translations/commands.js';
import { labels } from '../translations/labels.js';
import { logErrorFunctions } from '../translations/logs.js';
import {
  specialStringFunctions,
  specialStrings,
} from '../translations/special.js';
import {
  ticketMessageFunctions,
  ticketMessages,
} from '../translations/tickets.js';
import { deleteResponse, getChannel } from '../utils/channels.js';
import {
  getConfigProperty,
  getRoleProperty,
  getTicketProperty,
} from '../utils/config.js';
import { getGuild } from '../utils/guild.js';
import { COUNCIL_LEVEL, REGULAR_LEVEL } from '../utils/levels.js';
import { logger } from '../utils/logger.js';
import {
  isMemberBarred,
  isMemberInVip,
  isMemberLevel,
} from '../utils/members.js';
import { decidePoll, startSpecialPoll } from '../utils/polls.js';
import { USER_ID_REGEX } from '../utils/regex.js';
import {
  getCourseRolesBySemester,
  getMembersByRoleIds,
  getRoleFromSet,
  getRoles,
} from '../utils/roles.js';
import { type Poll, type PollOption, type SpecialPoll } from '@prisma/client';
import {
  type ButtonInteraction,
  ChannelType,
  type GuildMember,
  type GuildMemberRoleManager,
  roleMention,
  ThreadAutoArchiveDuration,
  userMention,
} from 'discord.js';

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
      ephemeral: true,
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
      ephemeral: true,
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
      ephemeral: true,
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
      ephemeral: true,
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
      ephemeral: true,
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

const handlePollButtonForVipRequestVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
) => {
  const vipChannel = getChannel('vip');
  const oathChannel = getChannel('oath');

  if (poll.decision !== labels.yes) {
    const rejectComponents = getVipAcknowledgeComponents();
    await oathChannel?.send({
      components: rejectComponents,
      content: specialStringFunctions.vipRequestRejected(specialPoll.userId),
    });

    await vipChannel?.send(
      specialStringFunctions.vipAddRejected(specialPoll.userId),
    );

    return;
  }

  const confirmEmbed = await getVipConfirmEmbed();
  const confirmComponents = getVipConfirmComponents();
  await oathChannel?.send({
    components: confirmComponents,
    content: specialStringFunctions.vipRequestAccepted(specialPoll.userId),
    embeds: [confirmEmbed],
  });

  await vipChannel?.send(
    specialStringFunctions.vipAddAccepted(specialPoll.userId),
  );
};

const handlePollButtonForVipAddVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
) => {
  const vipChannel = getChannel('vip');
  const oathChannel = getChannel('oath');

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.vipAddRejected(specialPoll.userId),
    );

    return;
  }

  const confirmEmbed = await getVipConfirmEmbed();
  const confirmComponents = getVipConfirmComponents();
  await oathChannel?.send({
    components: confirmComponents,
    content: specialStringFunctions.vipAddRequestAccepted(specialPoll.userId),
    embeds: [confirmEmbed],
  });

  await vipChannel?.send(
    specialStringFunctions.vipAddAccepted(specialPoll.userId),
  );
};

const handlePollButtonForVipRemoveVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel('vip');

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.vipRemoveRejected(specialPoll.userId),
    );

    return;
  }

  const vipRoleId = await getRoleProperty('vip');
  const councilRoleId = await getRoleProperty('council');
  await member.roles.remove(vipRoleId);
  await member.roles.remove(councilRoleId);

  await vipChannel?.send(
    specialStringFunctions.vipRemoveAccepted(specialPoll.userId),
  );
};

const handlePollButtonForCouncilAddVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel('vip');

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.councilAddRejected(specialPoll.userId),
    );

    return;
  }

  const councilRole = await getRoleProperty('council');
  await member.roles.add(councilRole);

  await vipChannel?.send(
    specialStringFunctions.councilAddAccepted(specialPoll.userId),
  );
};

const handlePollButtonForCouncilRemoveVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel('vip');

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.councilRemoveRejected(specialPoll.userId),
    );

    return;
  }

  const councilRole = await getRoleProperty('council');
  await member.roles.remove(councilRole);

  await vipChannel?.send(
    specialStringFunctions.councilRemoveAccepted(specialPoll.userId),
  );
};

const handlePollButtonForAdminAddVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel('vip');

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.adminAddRejected(specialPoll.userId),
    );

    return;
  }

  const adminsRole = await getRoleProperty('admins');
  const moderatorRole = await getRoleProperty('moderator');

  await member.roles.add(adminsRole);
  await member.roles.add(moderatorRole);

  await vipChannel?.send(
    specialStringFunctions.adminAddAccepted(specialPoll.userId),
  );
};

const handlePollButtonForAdminRemoveVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel('vip');

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.adminRemoveRejected(specialPoll.userId),
    );

    return;
  }

  const adminsRole = await getRoleProperty('admins');
  const moderatorRole = await getRoleProperty('moderator');

  await member.roles.remove(adminsRole);
  await member.roles.remove(moderatorRole);

  await vipChannel?.send(
    specialStringFunctions.adminRemoveAccepted(specialPoll.userId),
  );
};

const handlePollButtonForBarVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel('vip');

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.barRejected(specialPoll.userId),
    );

    return;
  }

  await createBar({
    userId: specialPoll.userId,
  });

  const regularsRoleId = await getRoleProperty('regular');
  const vipRoleId = await getRoleProperty('vip');
  const councilRoleId = await getRoleProperty('council');
  await member.roles.remove(regularsRoleId);
  await member.roles.remove(vipRoleId);
  await member.roles.remove(councilRoleId);

  await vipChannel?.send(
    specialStringFunctions.barAccepted(specialPoll.userId),
  );
};

const handlePollButtonForUnbarVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
) => {
  const vipChannel = getChannel('vip');

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      specialStringFunctions.unbarRejected(specialPoll.userId),
    );

    return;
  }

  await deleteBar(specialPoll.userId);

  await vipChannel?.send(
    specialStringFunctions.unbarAccepted(specialPoll.userId),
  );
};

export const handlePollButtonForSpecialVote = async (
  poll: Poll,
  member: GuildMember,
) => {
  if (!poll.done) {
    return;
  }

  const specialPoll = await getSpecialPollByPollId(poll.id);
  const type = specialPoll?.type;

  if (specialPoll === null || type === undefined) {
    return;
  }

  switch (type) {
    case 'vipRequest':
      await handlePollButtonForVipRequestVote(poll, specialPoll);
      break;

    case 'vipAdd':
      await handlePollButtonForVipAddVote(poll, specialPoll);
      break;

    case 'vipRemove':
      await handlePollButtonForVipRemoveVote(poll, specialPoll, member);
      break;

    case 'councilAdd':
      await handlePollButtonForCouncilAddVote(poll, specialPoll, member);
      break;

    case 'councilRemove':
      await handlePollButtonForCouncilRemoveVote(poll, specialPoll, member);
      break;

    case 'adminAdd':
      await handlePollButtonForAdminAddVote(poll, specialPoll, member);
      break;

    case 'adminRemove':
      await handlePollButtonForAdminRemoveVote(poll, specialPoll, member);
      break;

    case 'bar':
      await handlePollButtonForBarVote(poll, specialPoll, member);
      break;

    case 'unbar':
      await handlePollButtonForUnbarVote(poll, specialPoll);
      break;

    default:
      break;
  }

  await deleteSpecialPoll(specialPoll.id);
};

const handleVote = async (
  interaction: ButtonInteraction,
  poll: Poll,
  optionId: string,
  option: PollOption,
) => {
  const votes = await getPollVotesByPollIdAndUserId(
    poll.id,
    interaction.user.id,
  );
  let replyMessage;

  if (votes === null) {
    return;
  }

  if (poll.multiple) {
    if (
      votes.length === 0 ||
      !votes.some((vote) => vote.option.id === optionId)
    ) {
      await createPollVote({
        option: {
          connect: {
            id: optionId,
          },
        },
        poll: {
          connect: {
            id: poll.id,
          },
        },
        userId: interaction.user.id,
      });
      replyMessage = commandResponseFunctions.voteAdded(option.name);
    } else {
      await deletePollVote(
        votes.find((vote) => vote.option.id === optionId)?.id,
      );
      replyMessage = commandResponses.voteRemoved;
    }
  } else {
    const vote = votes[0] ?? null;

    if (vote === null) {
      await createPollVote({
        option: {
          connect: {
            id: optionId,
          },
        },
        poll: {
          connect: {
            id: poll.id,
          },
        },
        userId: interaction.user.id,
      });
      replyMessage = commandResponseFunctions.voteAdded(option.name);
    } else if (vote !== null && vote.option.id === optionId) {
      await deletePollVote(vote.id);
      replyMessage = commandResponses.voteRemoved;
    } else {
      await deletePollVote(vote.id);
      await createPollVote({
        option: {
          connect: {
            id: optionId,
          },
        },
        poll: {
          connect: {
            id: poll.id,
          },
        },
        userId: interaction.user.id,
      });

      replyMessage = commandResponseFunctions.voteAdded(option.name);
    }
  }

  const message = await interaction.reply({
    content: replyMessage,
    ephemeral: true,
  });
  void deleteResponse(message);
};

export const handlePollButton = async (
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

  const pollId = args[0]?.toString();
  const optionId = args[1]?.toString();
  const poll = await getPollById(pollId);
  const option = optionId === 'info' ? null : await getPollOptionById(optionId);

  if (optionId === 'info' && poll !== null) {
    const infoEmbed = await getPollInfoEmbed(guild, poll);
    await interaction.reply({
      embeds: [infoEmbed],
      ephemeral: true,
    });

    return;
  }

  if (
    poll === null ||
    option === null ||
    pollId === undefined ||
    optionId === undefined
  ) {
    const mess = await interaction.reply({
      content: commandErrors.pollOrOptionNotFound,
      ephemeral: true,
    });
    void deleteResponse(mess);

    return;
  }

  if (poll.done) {
    const pollEmbed = await getPollEmbed(poll);
    const pollComponents = getPollComponents(poll);
    await interaction.update({
      components: pollComponents,
      embeds: [pollEmbed],
    });

    return;
  }

  if (poll.roles.length !== 0) {
    const roles = interaction.member?.roles as GuildMemberRoleManager;

    if (!roles.cache.some((role) => poll.roles.includes(role.id))) {
      const mess = await interaction.reply({
        allowedMentions: {
          parse: [],
        },
        content: commandErrorFunctions.pollNoVotePermission(poll.roles),
        ephemeral: true,
      });
      void deleteResponse(mess);

      return;
    }
  }

  await handleVote(interaction, poll, optionId, option);
  await decidePoll(poll.id);

  const decidedPoll = await getPollById(poll.id);

  // Shouldn't ever happen, because we wouldn't have gotten here if the poll didn't exist
  if (decidedPoll === null) {
    return;
  }

  const specialPoll = await getSpecialPollByPollId(poll.id);
  const embed = await getPollEmbed(decidedPoll);
  const components = getPollComponents(decidedPoll);

  if (specialPoll !== null) {
    await interaction.message.edit({
      components,
      embeds: [embed],
    });

    const member = await guild.members.fetch(specialPoll.userId);
    await handlePollButtonForSpecialVote(decidedPoll, member);

    return;
  }

  await interaction.message.edit({
    components,
    embeds: [embed],
  });
};

export const handlePollStatsButton = async (
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

  const pollId = args[0]?.toString();
  const optionId = args[1]?.toString();
  const poll = await getPollById(pollId);

  if (poll === null || pollId === undefined || optionId === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionPollOrOptionNotFoundError(
        interaction.customId,
      ),
    );
    await interaction.deferUpdate();

    return;
  }

  const pollOption = await getPollOptionById(optionId);

  if (pollOption === null) {
    const mess = await interaction.reply({
      content: commandErrors.optionNotFound,
      ephemeral: true,
    });
    void deleteResponse(mess);

    return;
  }

  const votes = (await getPollVotesByOptionId(pollOption.id)) ?? [];

  await interaction.reply({
    allowedMentions: {
      parse: [],
    },
    content:
      votes.length === 0
        ? commandResponses.noVoters
        : votes.map((vote) => userMention(vote.userId)).join(', '),
    ephemeral: true,
  });
};

export const handleVipButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const member = interaction.member as GuildMember;

  if (await isMemberInVip(member)) {
    await interaction.reply({
      content: commandErrors.alreadyVipMember,
      ephemeral: true,
    });

    return;
  }

  if (await isMemberBarred(interaction.user.id)) {
    await interaction.reply({
      content: specialStrings.vipRejected,
      ephemeral: true,
    });

    return;
  }

  const vipRoleId = await getRoleProperty('vip');
  const councilRoleId = await getRoleProperty('council');

  if (args[0] === 'acknowledge') {
    if (
      interaction.user.id !==
      USER_ID_REGEX.exec(interaction.message.content)?.[0]
    ) {
      const resp = await interaction.reply({
        content: commandErrors.oathNoPermission,
        ephemeral: true,
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
        ephemeral: true,
      });
      void deleteResponse(resp);

      return;
    }

    const vipChannel = getChannel('vip');
    await vipChannel?.send(
      specialStringFunctions.vipWelcome(interaction.user.id),
    );

    await member.roles.add(vipRoleId);

    if (await isMemberLevel(member, COUNCIL_LEVEL)) {
      await member.roles.add(councilRoleId);
    }

    const message = await interaction.reply({
      content: specialStringFunctions.vipWelcome(interaction.user.id),
      ephemeral: true,
    });
    void deleteResponse(message);

    await interaction.message.delete();

    return;
  }

  if (await getConfigProperty('vipPause')) {
    const message = await interaction.reply({
      content: specialStrings.vipRequestPaused,
      ephemeral: true,
    });
    void deleteResponse(message);

    return;
  }

  if (!(await isMemberLevel(member, REGULAR_LEVEL))) {
    const message = await interaction.reply({
      content: specialStrings.vipRequestUnderLevel,
      ephemeral: true,
    });
    void deleteResponse(message);

    return;
  }

  const existingPoll = await getSpecialPollByUserAndType(
    interaction.user.id,
    'vipRequest',
  );
  if (existingPoll !== null) {
    const message = await interaction.reply({
      content: specialStrings.vipRequestActive,
      ephemeral: true,
    });
    void deleteResponse(message);

    return;
  }

  const specialPollId = await startSpecialPoll(
    interaction,
    interaction.user,
    'vipRequest',
  );

  if (specialPollId === null) {
    await interaction.reply({
      content: specialStrings.vipRequestFailed,
      ephemeral: true,
    });

    return;
  }

  const pollWithOptions = await getPollById(specialPollId);

  if (pollWithOptions === null) {
    await interaction.reply({
      content: specialStrings.vipRequestFailed,
      ephemeral: true,
    });

    return;
  }

  const channel = getChannel('polls');

  await channel?.send({
    components: getPollComponents(pollWithOptions),
    embeds: [await getPollEmbed(pollWithOptions)],
  });
  await channel?.send(roleMention(await getRoleProperty('council')));
  const components = getPollStatsComponents(pollWithOptions);
  await channel?.send({
    components,
    content: commandResponseFunctions.pollStats(pollWithOptions.title),
  });

  await interaction.reply({
    content: specialStrings.vipRequestSent,
    ephemeral: true,
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
      ephemeral: true,
    });

    return;
  }

  const reminder = await getReminderById(reminderId);

  if (authorId !== interaction.user.id) {
    await interaction.reply({
      content: commandErrors.reminderNoPermission,
      ephemeral: true,
    });

    return;
  }

  if (reminder === null) {
    const newReminders = await getRemindersByUserId(authorId);
    const newComponents = await getRemindersComponents(newReminders ?? []);

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
    ephemeral: true,
  });

  const reminders = await getRemindersByUserId(interaction.user.id);
  const components = await getRemindersComponents(reminders ?? []);
  await interaction.message.edit({
    components,
  });
};

export const handleTicketCreate = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const guild = await getGuild(interaction);
  const ticketType = args[0];

  if (ticketType === undefined) {
    await interaction.reply(commandErrors.invalidTicketType);

    return;
  }

  const ticketMetadata = await getTicketProperty(ticketType);

  if (ticketMetadata === null) {
    await interaction.reply(commandErrors.invalidTicketType);

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

  const ticketsChannel = getChannel('tickets');

  if (
    ticketsChannel === null ||
    ticketsChannel?.type !== ChannelType.GuildText
  ) {
    await interaction.reply(commandErrors.invalidChannel);

    return;
  }

  const ticketRoleMembers = await getMembersByRoleIds(
    guild,
    ticketMetadata.roles,
  );

  if (ticketRoleMembers.length === 0) {
    await interaction.reply({
      content: commandErrors.noTicketMembers,
      ephemeral: true,
    });

    return;
  }

  const ticketChannel = await ticketsChannel.threads.create({
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
    invitable: false,
    name: `${interaction.user.tag} - ${ticketMetadata.name}`,
    type: ChannelType.PrivateThread,
  });

  await ticketChannel.send(
    ticketMessageFunctions.ticketCreated(interaction.user.id),
  );

  const components = getTicketCloseComponents(ticketChannel.id);
  await ticketChannel.send({
    components,
    content: ticketMessages.sendMessage,
  });

  await interaction.reply({
    content: ticketMessageFunctions.ticketLink(ticketChannel.url),
    ephemeral: true,
  });

  const collector = ticketChannel.createMessageCollector({
    time: 300_000,
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  collector.once('collect', async () => {
    await ticketChannel.send(
      ticketMessageFunctions.ticketStarted(
        ticketMetadata.roles.map((role) => roleMention(role)).join(' '),
      ),
    );

    collector.stop();
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  collector.on('end', async (messages) => {
    if (messages.size > 0) {
      return;
    }

    await ticketChannel.delete();
  });
};

export const handleTicketClose = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const ticketId = args[0];

  if (ticketId === undefined) {
    await interaction.reply(commandErrors.invalidTicket);

    return;
  }

  const ticketsChannel = getChannel('tickets');

  if (
    ticketsChannel === undefined ||
    ticketsChannel.type !== ChannelType.GuildText
  ) {
    await interaction.reply(commandErrors.invalidTicket);

    return;
  }

  const ticketChannel = ticketsChannel.threads.cache.get(ticketId);

  if (ticketChannel === undefined) {
    await interaction.reply(commandErrors.invalidTicket);

    return;
  }

  await ticketChannel.setLocked(true);
  await ticketChannel.setArchived(true);

  await interaction.deferUpdate();
};
