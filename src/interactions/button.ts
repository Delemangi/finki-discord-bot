import {
  getPollComponents,
  getPollEmbed,
  getPollInfoEmbed,
  getPollStatsComponents,
} from "../components/polls.js";
import {
  getVipAcknowledgeComponents,
  getVipConfirmComponents,
  getVipConfirmEmbed,
} from "../components/scripts.js";
import { getPollById } from "../data/Poll.js";
import { getPollOptionById } from "../data/PollOption.js";
import {
  createPollVote,
  deletePollVote,
  getPollVotesByOptionId,
  getPollVotesByPollIdAndUserId,
} from "../data/PollVote.js";
import {
  deleteSpecialPoll,
  getSpecialPollByPollId,
  getSpecialPollByUserAndType,
} from "../data/SpecialPoll.js";
import {
  createVipBan,
  deleteVipBan,
  getVipBanByUserId,
} from "../data/VipBan.js";
import {
  commandErrorFunctions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from "../translations/commands.js";
import { labels } from "../translations/labels.js";
import { logErrorFunctions } from "../translations/logs.js";
import { vipStringFunctions, vipStrings } from "../translations/vip.js";
import { type PollWithOptions } from "../types/PollWithOptions.js";
import { deleteResponse, getChannel } from "../utils/channels.js";
import { getConfigProperty, getRoleProperty } from "../utils/config.js";
import { getGuild } from "../utils/guild.js";
import { logger } from "../utils/logger.js";
import { isMemberInVip } from "../utils/members.js";
import { decidePoll, startSpecialPoll } from "../utils/polls.js";
import { userIdRegex } from "../utils/regex.js";
import {
  getCourseRolesBySemester,
  getRole,
  getRoleFromSet,
  getRoles,
} from "../utils/roles.js";
import { type Poll, type PollOption, type SpecialPoll } from "@prisma/client";
import {
  type ButtonInteraction,
  type GuildMember,
  type GuildMemberRoleManager,
  roleMention,
  userMention,
} from "discord.js";

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

  const role = getRoleFromSet(guild, "courses", args[0]);

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

  const role = getRoleFromSet(guild, "year", args[0]);

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
    await roles.remove(getRoles(guild, "year"));
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

  const role = getRoleFromSet(guild, "program", args[0]);

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
    await roles.remove(getRoles(guild, "program"));
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

  const role = getRoleFromSet(guild, "notification", args[0]);

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

  const role = getRoleFromSet(guild, "color", args[0]);

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
    await roles.remove(getRoles(guild, "color"));
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
  if (interaction.guild === null || interaction.member === null) {
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
    args[0] === "all"
      ? getRoles(interaction.guild, "courses")
      : getCourseRolesBySemester(interaction.guild, semester);

  await member.roles.add(roles);

  try {
    await interaction.editReply({
      content:
        args[0] === "all"
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
  if (interaction.guild === null || interaction.member === null) {
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
    args[0] === "all"
      ? getRoles(interaction.guild, "courses")
      : getCourseRolesBySemester(interaction.guild, semester);

  await member.roles.remove(roles);

  try {
    await interaction.editReply({
      content:
        args[0] === "all"
          ? commandResponses.allCoursesRemoved
          : commandResponseFunctions.semesterCoursesRemoved(semester),
    });
  } catch (error) {
    logger.warn(logErrorFunctions.buttonInteractionResponseError(error));
  }
};

const handlePollButtonForVipAddVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
) => {
  const vipChannel = getChannel("vip");
  const oathChannel = getChannel("oath");

  if (poll.decision !== labels.yes) {
    const rejectComponents = getVipAcknowledgeComponents();
    await oathChannel?.send({
      components: rejectComponents,
      content: vipStringFunctions.vipAddRequestRejected(specialPoll.userId),
    });

    await vipChannel?.send(
      vipStringFunctions.vipAddRejected(specialPoll.userId),
    );

    return;
  }

  const confirmEmbed = await getVipConfirmEmbed();
  const confirmComponents = getVipConfirmComponents();
  await oathChannel?.send({
    components: confirmComponents,
    content: vipStringFunctions.vipAddRequestAccepted(specialPoll.userId),
    embeds: [confirmEmbed],
  });

  await vipChannel?.send(vipStringFunctions.vipAddAccepted(specialPoll.userId));
};

const handlePollButtonForVipRemoveVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel("vip");

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      vipStringFunctions.vipRemoveRejected(specialPoll.userId),
    );

    return;
  }

  const vipRoleId = await getRoleProperty("vip");
  const councilRoleId = await getRoleProperty("council");
  await member.roles.remove(vipRoleId);
  await member.roles.remove(councilRoleId);

  await vipChannel?.send(
    vipStringFunctions.vipRemoveAccepted(specialPoll.userId),
  );
};

const handlePollButtonForVipUpgradeVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel("vip");

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      vipStringFunctions.vipUpgradeRejected(specialPoll.userId),
    );

    return;
  }

  const councilRole = await getRoleProperty("council");
  await member.roles.add(councilRole);

  await vipChannel?.send(
    vipStringFunctions.vipUpgradeAccepted(specialPoll.userId),
  );
};

const handlePollButtonForVipBanVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
  member: GuildMember,
) => {
  const vipChannel = getChannel("vip");

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      vipStringFunctions.vipBanRejected(specialPoll.userId),
    );

    return;
  }

  await createVipBan({
    userId: specialPoll.userId,
  });

  const vipInvitedRole = await getRoleProperty("council");
  await member.roles.remove(vipInvitedRole);

  await vipChannel?.send(vipStringFunctions.vipBanAccepted(specialPoll.userId));
};

const handlePollButtonForVipUnbanVote = async (
  poll: Poll,
  specialPoll: SpecialPoll,
) => {
  const vipChannel = getChannel("vip");

  if (poll.decision !== labels.yes) {
    await vipChannel?.send(
      vipStringFunctions.vipUnbanRejected(specialPoll.userId),
    );

    return;
  }

  await deleteVipBan(specialPoll.userId);

  await vipChannel?.send(
    vipStringFunctions.vipUnbanAccepted(specialPoll.userId),
  );
};

export const handlePollButtonForVipVote = async (
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
    case "vipAdd":
      await handlePollButtonForVipAddVote(poll, specialPoll);
      break;

    case "vipRemove":
      await handlePollButtonForVipRemoveVote(poll, specialPoll, member);
      break;

    case "councilAdd":
      await handlePollButtonForVipUpgradeVote(poll, specialPoll, member);
      break;

    case "vipBan":
      await handlePollButtonForVipBanVote(poll, specialPoll, member);
      break;

    case "vipUnban":
      await handlePollButtonForVipUnbanVote(poll, specialPoll);
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
  if (interaction.guild === null || interaction.member === null) {
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
  const option = optionId === "info" ? null : await getPollOptionById(optionId);

  if (optionId === "info" && poll !== null) {
    const infoEmbed = await getPollInfoEmbed(interaction.guild, poll);
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
    const roles = interaction.member.roles as GuildMemberRoleManager;

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

  const specialPoll = await getSpecialPollByPollId(poll.id);
  const embed = await getPollEmbed(decidedPoll as PollWithOptions);
  const components = getPollComponents(decidedPoll as PollWithOptions);

  if (specialPoll !== null) {
    await interaction.message.edit({
      components,
      embeds: [embed],
    });

    const member = await interaction.guild.members.fetch(specialPoll.userId);
    await handlePollButtonForVipVote(decidedPoll as PollWithOptions, member);

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
  if (interaction.guild === null || interaction.member === null) {
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
        : votes.map((vote) => userMention(vote.userId)).join(", "),
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

  const vipBan = await getVipBanByUserId(interaction.user.id);

  if (vipBan !== null) {
    await interaction.reply({
      content: vipStrings.vipBanned,
      ephemeral: true,
    });

    return;
  }

  const vipRole = getRole("vip");

  if (args[0] === "acknowledge") {
    if (
      interaction.user.id !== userIdRegex.exec(interaction.message.content)?.[0]
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

  if (args[0] === "confirm") {
    if (
      interaction.user.id !== userIdRegex.exec(interaction.message.content)?.[0]
    ) {
      const resp = await interaction.reply({
        content: commandErrors.oathNoPermission,
        ephemeral: true,
      });
      void deleteResponse(resp);

      return;
    }

    const vipChannel = getChannel("vip");

    if (vipChannel?.isTextBased()) {
      await vipChannel.send(vipStringFunctions.vipWelcome(interaction.user.id));
    }

    if (vipRole !== undefined) {
      await member.roles.add(vipRole);
    }

    const message = await interaction.reply({
      content: vipStringFunctions.vipWelcome(interaction.user.id),
      ephemeral: true,
    });
    void deleteResponse(message);

    await interaction.message.delete();

    const regularRole = getRole("regular");

    if (regularRole !== undefined) {
      await member.roles.remove(regularRole);
    }

    return;
  }

  const existingPoll = await getSpecialPollByUserAndType(
    interaction.user.id,
    "add",
  );
  if (existingPoll !== null) {
    const message = await interaction.reply({
      content: vipStrings.vipRequestActive,
      ephemeral: true,
    });
    void deleteResponse(message);

    return;
  }

  if (await getConfigProperty("vipPause")) {
    const message = await interaction.reply({
      content: vipStrings.vipRequestPaused,
      ephemeral: true,
    });
    void deleteResponse(message);

    return;
  }

  const specialPollId = await startSpecialPoll(
    interaction,
    interaction.user,
    "vipAdd",
    0.67,
  );

  if (specialPollId === null) {
    await interaction.reply({
      content: vipStrings.vipRequestFailed,
      ephemeral: true,
    });

    return;
  }

  const pollWithOptions = await getPollById(specialPollId);

  if (pollWithOptions === null) {
    await interaction.reply({
      content: vipStrings.vipRequestFailed,
      ephemeral: true,
    });

    return;
  }

  const channel = getChannel("polls");

  await channel?.send({
    components: getPollComponents(pollWithOptions),
    embeds: [await getPollEmbed(pollWithOptions)],
  });
  await channel?.send(roleMention(await getRoleProperty("council")));
  const components = getPollStatsComponents(pollWithOptions);
  await channel?.send({
    components,
    content: commandResponseFunctions.pollStats(pollWithOptions.title),
  });

  await interaction.reply({
    content: vipStrings.vipRequestSent,
    ephemeral: true,
  });
};
