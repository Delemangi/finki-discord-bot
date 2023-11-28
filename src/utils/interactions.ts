import { deleteResponse, getChannel, log } from "./channels.js";
import { getCommand } from "./commands.js";
import {
  getAutocompleteEmbed,
  getButtonEmbed,
  getChatInputCommandEmbed,
  getPollComponents,
  getPollEmbed,
  getPollInfoEmbed,
  getPollStatsComponents,
  getUserContextMenuCommandEmbed,
  getVipAcknowledgeComponents,
  getVipConfirmComponents,
  getVipConfirmEmbed,
} from "./components.js";
import {
  getClassrooms,
  getConfigProperty,
  getCourses,
  getFromRoleConfig,
  getRoleProperty,
  getSessions,
  getStaff,
} from "./config.js";
import { createOptions } from "./functions.js";
import { logger } from "./logger.js";
import { isMemberInVip } from "./members.js";
import { transformOptions } from "./options.js";
import { hasCommandPermission } from "./permissions.js";
import { decidePoll, startSpecialPoll } from "./polls.js";
import { userIdRegex } from "./regex.js";
import {
  getCourseRolesBySemester,
  getRole,
  getRoleFromSet,
  getRoles,
} from "./roles.js";
import {
  commandErrorFunctions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
  logErrorFunctions,
  logShortStrings,
  shortStrings,
  vipStringFunctions,
  vipStrings,
} from "./strings.js";
import { getCompanies } from "@app/data/Company.js";
import { getLinkNames } from "@app/data/Link.js";
import { getPollById } from "@app/data/Poll.js";
import { getPollOptionById } from "@app/data/PollOption.js";
import {
  createPollVote,
  deletePollVote,
  getPollVotesByOptionId,
  getPollVotesByPollIdAndUserId,
} from "@app/data/PollVote.js";
import { getQuestionNames } from "@app/data/Question.js";
import { getRules } from "@app/data/Rule.js";
import {
  deleteSpecialPoll,
  getSpecialPollByPollId,
  getSpecialPollByUserAndType,
} from "@app/data/SpecialPoll.js";
import {
  createVipBan,
  deleteVipBan,
  getVipBanByUserId,
} from "@app/data/VipBan.js";
import { type PollWithOptions } from "@app/types/PollWithOptions.js";
import { type Poll, type PollOption, type SpecialPoll } from "@prisma/client";
import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type GuildMember,
  type GuildMemberRoleManager,
  roleMention,
  type UserContextMenuCommandInteraction,
  userMention,
} from "discord.js";

// Buttons

const handleCourseButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null) {
    logger.warn(
      logErrorFunctions.buttonInteractionOutsideGuildError(
        interaction.customId,
      ),
    );

    return;
  }

  const role = getRoleFromSet(interaction.guild, "courses", args[0]);

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

const handleYearButton = async (
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

  const role = getRoleFromSet(interaction.guild, "year", args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(interaction.guild, "year"));
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

const handleProgramButton = async (
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

  const role = getRoleFromSet(interaction.guild, "program", args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(interaction.guild, "program"));
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

const handleNotificationButton = async (
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

  const role = getRoleFromSet(interaction.guild, "notification", args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

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

const handleColorButton = async (
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

  const role = getRoleFromSet(interaction.guild, "color", args[0]);

  if (role === undefined) {
    logger.warn(
      logErrorFunctions.buttonInteractionRoleError(interaction.customId),
    );

    return;
  }

  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(interaction.guild, "color"));
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

const handleAddCoursesButton = async (
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

const handleRemoveCoursesButton = async (
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

  if (poll.decision !== shortStrings.yes) {
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

  if (poll.decision !== shortStrings.yes) {
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

  if (poll.decision !== shortStrings.yes) {
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

  if (poll.decision !== shortStrings.yes) {
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

  if (poll.decision !== shortStrings.yes) {
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

const handlePollButton = async (
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

const handlePollStatsButton = async (
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

const handleVipButton = async (
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

// Autocomplete interactions

let transformedCourses: Array<[string, string]> | null = null;
let transformedProfessors: Array<[string, string]> | null = null;
let transformedCourseRoles: Array<[string, string]> | null = null;
let transformedSessions: Array<[string, string]> | null = null;
let transformedClassrooms: Array<[string, string]> | null = null;

const handleCourseAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedCourses === null) {
    transformedCourses = Object.entries(transformOptions(getCourses()));
  }

  try {
    await interaction.respond(
      createOptions(transformedCourses, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

const handleProfessorAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedProfessors === null) {
    transformedProfessors = Object.entries(
      transformOptions(getStaff().map((professor) => professor.name)),
    );
  }

  try {
    await interaction.respond(
      createOptions(transformedProfessors, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

const handleCourseRoleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedCourseRoles === null) {
    transformedCourseRoles = Object.entries(
      transformOptions(Object.values(getFromRoleConfig("courses"))),
    );
  }

  try {
    await interaction.respond(
      createOptions(transformedCourseRoles, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

const handleQuestionAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const questionNames = await getQuestionNames();

  if (questionNames === null) {
    return;
  }

  try {
    await interaction.respond(
      createOptions(
        Object.entries(transformOptions(questionNames.map(({ name }) => name))),
        interaction.options.getFocused(),
      ),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

const handleLinkAutocomplete = async (interaction: AutocompleteInteraction) => {
  const linkNames = await getLinkNames();

  if (linkNames === null) {
    return;
  }

  try {
    await interaction.respond(
      createOptions(
        Object.entries(transformOptions(linkNames.map(({ name }) => name))),
        interaction.options.getFocused(),
      ),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleSessionAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedSessions === null) {
    transformedSessions = Object.entries(
      transformOptions(Object.keys(getSessions())),
    );
  }

  try {
    await interaction.respond(
      createOptions(transformedSessions, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleClassroomAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedClassrooms === null) {
    transformedClassrooms = Object.entries(
      transformOptions(
        getClassrooms().map(
          (classroom) => `${classroom.classroom} (${classroom.location})`,
        ),
      ),
    );
  }

  try {
    await interaction.respond(
      createOptions(transformedClassrooms, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleRuleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const rules = await getRules();

  if (rules === null) {
    return;
  }

  try {
    await interaction.respond(
      createOptions(
        Object.entries(transformOptions(rules.map(({ rule }) => rule))),
        interaction.options.getFocused(),
      ),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleCompanyAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const companies = await getCompanies();

  if (companies === null) {
    return;
  }

  try {
    await interaction.respond(
      createOptions(
        Object.entries(transformOptions(companies.map(({ name }) => name))),
        interaction.options.getFocused(),
      ),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

// Interactions

const ignoredButtons = ["help", "polls", "exp"];

export const handleChatInputCommand = async (
  interaction: ChatInputCommandInteraction,
) => {
  try {
    await interaction.deferReply();
  } catch (error) {
    logger.error(
      logErrorFunctions.chatInputInteractionDeferError(interaction, error),
    );
    await interaction.reply(commandErrors.commandError);

    return;
  }

  const command = await getCommand(interaction.commandName);

  logger.info(
    `${logShortStrings.chat} ${interaction.user.tag}: ${interaction} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await log(
    await getChatInputCommandEmbed(interaction),
    interaction,
    "commands",
  );

  if (command === undefined) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));
    await interaction.editReply(commandErrors.commandNotFound);

    return;
  }

  const fullCommand = (
    interaction.commandName +
    " " +
    (interaction.options.getSubcommand(false) ?? "")
  ).trim();

  if (
    !(await hasCommandPermission(
      interaction.member as GuildMember | null,
      fullCommand,
    ))
  ) {
    await interaction.editReply(commandErrors.commandNoPermission);

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      logErrorFunctions.chatInputInteractionError(interaction, error),
    );
  }
};

export const handleUserContextMenuCommand = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  try {
    await interaction.deferReply();
  } catch (error) {
    logger.error(
      logErrorFunctions.userContextMenuInteractionDeferError(
        interaction,
        error,
      ),
    );
    await interaction.reply(commandErrors.commandError);

    return;
  }

  const command = await getCommand(interaction.commandName);

  logger.info(
    `${logShortStrings.user} ${interaction.user.tag}: ${
      interaction.commandName
    } [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await log(
    await getUserContextMenuCommandEmbed(interaction),
    interaction,
    "commands",
  );

  if (command === undefined) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      logErrorFunctions.userContextMenuInteractionError(interaction, error),
    );
  }
};

const buttonInteractionHandlers = {
  addCourses: handleAddCoursesButton,
  color: handleColorButton,
  course: handleCourseButton,
  notification: handleNotificationButton,
  poll: handlePollButton,
  pollStats: handlePollStatsButton,
  program: handleProgramButton,
  removeCourses: handleRemoveCoursesButton,
  vip: handleVipButton,
  year: handleYearButton,
};

const ephemeralResponseButtons = ["addCourses", "removeCourses"];

export const handleButton = async (interaction: ButtonInteraction) => {
  const [command, ...args] = interaction.customId.split(":");

  logger.info(
    `${logShortStrings.button} ${interaction.user.tag}: ${
      interaction.customId
    } [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await log(
    getButtonEmbed(interaction, command, args),
    interaction,
    "commands",
  );

  if (command === undefined) {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));

    return;
  }

  if (ephemeralResponseButtons.includes(command)) {
    try {
      const mess = await interaction.deferReply({
        ephemeral: true,
      });
      void deleteResponse(mess, 10_000);
    } catch (error) {
      logger.error(
        logErrorFunctions.buttonInteractionDeferError(interaction, error),
      );
    }
  }

  if (Object.keys(buttonInteractionHandlers).includes(command)) {
    await buttonInteractionHandlers[
      command as keyof typeof buttonInteractionHandlers
    ](interaction, args);
  } else if (ignoredButtons.includes(command)) {
    // Do nothing
  } else {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));
  }
};

const autocompleteInteractionHandlers = {
  classroom: handleClassroomAutocomplete,
  company: handleCompanyAutocomplete,
  course: handleCourseAutocomplete,
  courserole: handleCourseRoleAutocomplete,
  link: handleLinkAutocomplete,
  professor: handleProfessorAutocomplete,
  question: handleQuestionAutocomplete,
  rule: handleRuleAutocomplete,
  session: handleSessionAutocomplete,
};

export const handleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const option = interaction.options.getFocused(true);

  logger.info(
    `${logShortStrings.auto} ${interaction.user.tag}: ${option.name} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? logShortStrings.dm
        : logShortStrings.guild
    }]`,
  );
  await log(getAutocompleteEmbed(interaction), interaction, "commands");

  if (Object.keys(autocompleteInteractionHandlers).includes(option.name)) {
    await autocompleteInteractionHandlers[
      option.name as keyof typeof autocompleteInteractionHandlers
    ](interaction);
  } else {
    logger.warn(logErrorFunctions.commandNotFound(interaction.id));
  }
};
