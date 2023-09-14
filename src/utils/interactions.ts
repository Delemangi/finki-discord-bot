import { getCompanies } from "../data/Company.js";
import { getLinkNames } from "../data/Link.js";
import { decidePoll, getPollById } from "../data/Poll.js";
import { getPollOptionById } from "../data/PollOption.js";
import {
  createPollVote,
  deletePollVote,
  getPollVotesByOptionId,
  getPollVotesByPollIdAndUserId,
} from "../data/PollVote.js";
import { getQuestionNames } from "../data/Question.js";
import { getRules } from "../data/Rule.js";
import {
  deleteVipPoll,
  getVipPollByPollId,
  getVipPollByUserAndType,
} from "../data/VipPoll.js";
import { type PollWithOptions } from "../types/PollWithOptions.js";
import { deleteResponse, getChannel, log } from "./channels.js";
import { getCommand } from "./commands.js";
import {
  getAutocompleteEmbed,
  getButtonEmbed,
  getChatInputCommandEmbed,
  getPollComponents,
  getPollEmbed,
  getPollInfoEmbed,
  getPollStatsButtonEmbed,
  getPollStatsComponents,
  getPollStatsEmbed,
  getUserContextMenuCommandEmbed,
  getVipAcknowledgeComponents,
  getVipConfirmComponents,
  getVipConfirmEmbed,
} from "./components.js";
import {
  getClassrooms,
  getCourses,
  getFromRoleConfig,
  getSessions,
  getStaff,
} from "./config.js";
import { createOptions } from "./functions.js";
import { logger } from "./logger.js";
import { transformOptions } from "./options.js";
import { hasCommandPermission } from "./permissions.js";
import { startVipPoll } from "./polls.js";
import {
  getCourseRolesBySemester,
  getRole,
  getRoleFromSet,
  getRoles,
} from "./roles.js";
import { errors } from "./strings.js";
import { type Poll, type PollOption, type VipPoll } from "@prisma/client";
import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type GuildMember,
  type GuildMemberRoleManager,
  inlineCode,
  PermissionsBitField,
  roleMention,
  type UserContextMenuCommandInteraction,
  userMention,
} from "discord.js";

// Buttons

const userIdRegex = /(?<=<@)\d+(?=>)/u;

const handleCourseButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  if (interaction.guild === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, "courses", args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`
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
      content: `Го ${
        removed ? "отстранивте" : "земавте"
      } предметот ${inlineCode(
        getFromRoleConfig("courses")[role.name] ?? "None"
      )}.`,
      ephemeral: true,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleYearButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, "year", args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`
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
      content: `Ја ${removed ? "отстранивте" : "земавте"} годината ${inlineCode(
        role.name
      )}.`,
      ephemeral: true,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleProgramButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, "program", args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`
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
      content: `Го ${removed ? "отстранивте" : "земавте"} смерот ${inlineCode(
        role.name
      )}.`,
      ephemeral: true,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleNotificationButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, "notification", args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`
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
      content: `${
        removed ? "Исклучивте" : "Вклучивте"
      } нотификации за ${inlineCode(role.name)}.`,
      ephemeral: true,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleColorButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, "color", args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`
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
      content: `Ја ${removed ? "отстранивте" : "земавте"} бојата ${inlineCode(
        role.name
      )}.`,
      ephemeral: true,
    });
    void deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleAddCoursesButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`
    );
    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} without arguments`
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
          ? "Ги земавте сите предмети."
          : `Ги земавте предметите од семестар ${semester}.`,
    });
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleRemoveCoursesButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`
    );
    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} without arguments`
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
          ? "Ги отстранивте сите предмети."
          : `Ги отстранивте предметите за семестар ${semester}.`,
    });
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`
    );
  }
};

const handlePollButtonForVipAddVote = async (poll: Poll, vipPoll: VipPoll) => {
  const vipChannel = getChannel("vip");
  const oathChannel = getChannel("oath");

  if (poll.decision === "Да") {
    await vipChannel?.send(
      `Корисникот ${userMention(vipPoll.userId)} е одобрен како член на ВИП.`
    );

    await deleteVipPoll(vipPoll.id);

    const embed = await getVipConfirmEmbed();
    const components = getVipConfirmComponents();
    await oathChannel?.send({
      components,
      content: `${userMention(vipPoll.userId)} ${
        vipPoll.type === "add"
          ? "Вашата молба за член на ВИП беше одобрена."
          : "Вие сте поканети да бидете член на ВИП."
      }`,
      embeds: [embed],
    });
  } else {
    await vipChannel?.send(
      `Корисникот ${userMention(vipPoll.userId)} не е одобрен како член на ВИП.`
    );

    await deleteVipPoll(vipPoll.id);

    const components = getVipAcknowledgeComponents();
    if (vipPoll.type === "add") {
      await oathChannel?.send({
        components,
        content: `${userMention(
          vipPoll.userId
        )} Вашата молба за член на ВИП беше одбиена.`,
      });
    }
  }
};

const handlePollButtonForVipRemoveVote = async (
  poll: Poll,
  vipPoll: VipPoll,
  member: GuildMember
) => {
  const vipChannel = getChannel("vip");

  if (poll.decision === "Да") {
    await deleteVipPoll(vipPoll.id);

    const vipRole = getRole("vip");
    const vipVotingRole = getRole("vipVoting");

    if (vipRole !== undefined) {
      await member.roles.remove(vipRole);
    }

    if (vipVotingRole !== undefined) {
      await member.roles.remove(vipVotingRole);
    }

    await vipChannel?.send(
      `Изгласана е недоверба против членот на ВИП ${userMention(
        vipPoll.userId
      )}.`
    );
  } else {
    await vipChannel?.send(
      `Не е изгласана недоверба против членот на ВИП ${userMention(
        vipPoll.userId
      )}.`
    );
  }
};

const handlePollButtonForVipUpgradeVote = async (
  poll: Poll,
  vipPoll: VipPoll,
  member: GuildMember
) => {
  const vipChannel = getChannel("vip");

  if (poll.decision === "Да") {
    await vipChannel?.send(
      `Корисникот ${userMention(
        vipPoll.userId
      )} е сега полноправен член на ВИП.`
    );

    await deleteVipPoll(vipPoll.id);

    const vipVotingRole = getRole("vipVoting");

    if (vipVotingRole !== undefined) {
      await member.roles.add(vipVotingRole);
    }
  } else {
    await vipChannel?.send(
      `Корисникот ${userMention(
        vipPoll.userId
      )} не е одобрен како полноправен член на ВИП.`
    );

    await deleteVipPoll(vipPoll.id);
  }
};

export const handlePollButtonForVipVote = async (
  poll: Poll,
  member: GuildMember
) => {
  if (!poll.done) {
    return;
  }

  const vipPoll = await getVipPollByPollId(poll.id);
  const type = vipPoll?.type;

  if (vipPoll === null || type === undefined) {
    return;
  }

  switch (type) {
    case "add":
      await handlePollButtonForVipAddVote(poll, vipPoll);
      break;
    case "remove":
      await handlePollButtonForVipRemoveVote(poll, vipPoll, member);
      break;
    case "upgrade":
      await handlePollButtonForVipUpgradeVote(poll, vipPoll, member);
      break;
    default:
      break;
  }
};

const handleVote = async (
  interaction: ButtonInteraction,
  poll: Poll,
  optionId: string,
  option: PollOption
) => {
  const votes = await getPollVotesByPollIdAndUserId(
    poll.id,
    interaction.user.id
  );
  let replyMessage;

  if (poll.multiple) {
    if (
      votes.length === 0 ||
      !votes.some((vote) => vote.option.id === optionId)
    ) {
      await createPollVote({
        option: { connect: { id: optionId } },
        poll: { connect: { id: poll.id } },
        userId: interaction.user.id,
      });
      replyMessage = `Гласавте за опцијата ${inlineCode(option.name)}.`;
    } else {
      await deletePollVote(
        votes.find((vote) => vote.option.id === optionId)?.id
      );
      replyMessage = "Го тргнавте вашиот глас.";
    }
  } else {
    const vote = votes[0] ?? null;

    if (vote === null) {
      await createPollVote({
        option: { connect: { id: optionId } },
        poll: { connect: { id: poll.id } },
        userId: interaction.user.id,
      });
      replyMessage = `Гласавте за опцијата ${inlineCode(option.name)}.`;
    } else if (vote !== null && vote.option.id === optionId) {
      await deletePollVote(vote.id);
      replyMessage = "Го тргнавте вашиот глас.";
    } else {
      await deletePollVote(vote.id);
      await createPollVote({
        option: { connect: { id: optionId } },
        poll: { connect: { id: poll.id } },
        userId: interaction.user.id,
      });

      replyMessage = `Гласавте за опцијата ${inlineCode(option.name)}.`;
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
  args: string[]
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`
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
      content: "Веќе не постои анкетата или опцијата.",
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
        allowedMentions: { parse: [] },
        content: `Немате дозвола да гласате на оваа анкета. Потребна ви е една од улогите: ${poll.roles
          .map((role) => roleMention(role))
          .join(", ")}`,
        ephemeral: true,
      });
      void deleteResponse(mess);
      return;
    }
  }

  await handleVote(interaction, poll, optionId, option);
  await decidePoll(poll.id, interaction);

  const decidedPoll = await getPollById(poll.id);

  const embed = await getPollEmbed(decidedPoll as PollWithOptions);
  const components = getPollComponents(decidedPoll as PollWithOptions);
  await interaction.message.edit({
    components,
    embeds: [embed],
  });

  const vipPoll = await getVipPollByPollId(poll.id);
  if (vipPoll !== null) {
    const member = await interaction.guild.members.fetch(vipPoll.userId);
    await handlePollButtonForVipVote(decidedPoll as PollWithOptions, member);
  }
};

const handlePollStatsButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`
    );
    return;
  }

  const pollId = args[0]?.toString();
  const optionId = args[1]?.toString();
  const poll = await getPollById(pollId);

  if (poll === null || pollId === undefined || optionId === undefined) {
    logger.warn(
      `Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} for a non-existent poll or option`
    );
    await interaction.deferUpdate();
    return;
  }

  const pollOption = await getPollOptionById(optionId);

  if (pollOption === null) {
    const mess = await interaction.reply({
      content: "Оваа опција не постои.",
      ephemeral: true,
    });
    void deleteResponse(mess);
    return;
  }

  const votes = (await getPollVotesByOptionId(pollOption.id)) ?? [];

  await interaction.message.edit({
    components: getPollStatsComponents(poll),
    embeds: [await getPollStatsEmbed(poll)],
  });

  const embed = await getPollStatsButtonEmbed(poll.id, pollOption.name, votes);
  const message = await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
  void deleteResponse(message);
};

const handleVipButton = async (
  interaction: ButtonInteraction,
  args: string[]
) => {
  const member = interaction.member as GuildMember;

  if (
    member.permissions.has(PermissionsBitField.Flags.Administrator) ||
    member.roles.cache.has(getRole("vip")?.id ?? "") ||
    member.roles.cache.has(getRole("admin")?.id ?? "")
  ) {
    const message = await interaction.reply({
      content: "Веќе сте член на ВИП.",
      ephemeral: true,
    });
    void deleteResponse(message);
    return;
  }

  const vipRole = getRole("vip");

  if (args[0] === "acknowledge") {
    if (
      interaction.user.id !== userIdRegex.exec(interaction.message.content)?.[0]
    ) {
      const resp = await interaction.reply({
        content: "Ова не е ваша заклетва.",
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
        content: "Ова не е ваша заклетва.",
        ephemeral: true,
      });
      void deleteResponse(resp);
      return;
    }

    const vipChannel = getChannel("vip");

    if (vipChannel?.isTextBased()) {
      await vipChannel.send(
        `${userMention(interaction.user.id)} е сега член на ВИП.`
      );
    }

    if (vipRole !== undefined) {
      await member.roles.add(vipRole);
    }

    const message = await interaction.reply({
      content: "Сега сте член на ВИП.",
      ephemeral: true,
    });
    void deleteResponse(message);

    await interaction.message.delete();

    const vipInvitedRole = getRole("vipInvited");

    if (vipInvitedRole !== undefined) {
      await member.roles.remove(vipInvitedRole);
    }

    return;
  }

  const existingPoll = await getVipPollByUserAndType(
    interaction.user.id,
    "add"
  );
  if (existingPoll !== null) {
    const message = await interaction.reply({
      content: "Веќе имате активна молба за ВИП.",
      ephemeral: true,
    });
    void deleteResponse(message);
    return;
  }

  const vipPollId = await startVipPoll(interaction, interaction.user, "add");
  const channel = getChannel("polls");

  if (channel?.isTextBased() && vipPollId !== null) {
    const pollWithOptions = await getPollById(vipPollId);

    if (pollWithOptions === null) {
      logger.error("Couldn't find the VIP poll");
      return;
    }

    await channel.send({
      components: getPollComponents(pollWithOptions),
      embeds: [await getPollEmbed(pollWithOptions)],
    });
  }

  const mess = await interaction.reply({
    content:
      "Испратена е молба за разгледување до членовите на ВИП. Ќе добиете повратна порака штом е донесена одлука. Со среќа! :grin:",
    ephemeral: true,
  });
  void deleteResponse(mess);
};

// Autocomplete interactions

let transformedCourses: Array<[string, string]> | null = null;
let transformedProfessors: Array<[string, string]> | null = null;
let transformedCourseRoles: Array<[string, string]> | null = null;
let transformedSessions: Array<[string, string]> | null = null;
let transformedClassrooms: Array<[string, string]> | null = null;

const handleCourseAutocomplete = async (
  interaction: AutocompleteInteraction
) => {
  if (transformedCourses === null) {
    transformedCourses = Object.entries(transformOptions(getCourses()));
  }

  try {
    await interaction.respond(
      createOptions(transformedCourses, interaction.options.getFocused())
    );
  } catch (error) {
    logger.error(
      `Failed to respond to course autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleProfessorAutocomplete = async (
  interaction: AutocompleteInteraction
) => {
  if (transformedProfessors === null) {
    transformedProfessors = Object.entries(
      transformOptions(getStaff().map((professor) => professor.name))
    );
  }

  try {
    await interaction.respond(
      createOptions(transformedProfessors, interaction.options.getFocused())
    );
  } catch (error) {
    logger.error(
      `Failed to respond to professor autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleCourseRoleAutocomplete = async (
  interaction: AutocompleteInteraction
) => {
  if (transformedCourseRoles === null) {
    transformedCourseRoles = Object.entries(
      transformOptions(Object.values(getFromRoleConfig("courses")))
    );
  }

  try {
    await interaction.respond(
      createOptions(transformedCourseRoles, interaction.options.getFocused())
    );
  } catch (error) {
    logger.error(
      `Failed to respond to course role autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleQuestionAutocomplete = async (
  interaction: AutocompleteInteraction
) => {
  try {
    await interaction.respond(
      createOptions(
        Object.entries(
          transformOptions((await getQuestionNames()).map(({ name }) => name))
        ),
        interaction.options.getFocused()
      )
    );
  } catch (error) {
    logger.error(
      `Failed to respond to question autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

const handleLinkAutocomplete = async (interaction: AutocompleteInteraction) => {
  try {
    await interaction.respond(
      createOptions(
        Object.entries(
          transformOptions((await getLinkNames()).map(({ name }) => name))
        ),
        interaction.options.getFocused()
      )
    );
  } catch (error) {
    logger.error(
      `Failed to respond to link autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

export const handleSessionAutocomplete = async (
  interaction: AutocompleteInteraction
) => {
  if (transformedSessions === null) {
    transformedSessions = Object.entries(
      transformOptions(Object.keys(getSessions()))
    );
  }

  try {
    await interaction.respond(
      createOptions(transformedSessions, interaction.options.getFocused())
    );
  } catch (error) {
    logger.error(
      `Failed to respond to session autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

export const handleClassroomAutocomplete = async (
  interaction: AutocompleteInteraction
) => {
  if (transformedClassrooms === null) {
    transformedClassrooms = Object.entries(
      transformOptions(
        getClassrooms().map(
          (classroom) => `${classroom.classroom} (${classroom.location})`
        )
      )
    );
  }

  try {
    await interaction.respond(
      createOptions(transformedClassrooms, interaction.options.getFocused())
    );
  } catch (error) {
    logger.error(
      `Failed to respond to classroom autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

export const handleRuleAutocomplete = async (
  interaction: AutocompleteInteraction
) => {
  try {
    await interaction.respond(
      createOptions(
        Object.entries(
          transformOptions((await getRules()).map(({ rule }) => rule))
        ),
        interaction.options.getFocused()
      )
    );
  } catch (error) {
    logger.error(
      `Failed to respond to rule autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

export const handleCompanyAutocomplete = async (
  interaction: AutocompleteInteraction
) => {
  try {
    await interaction.respond(
      createOptions(
        Object.entries(
          transformOptions((await getCompanies()).map(({ name }) => name))
        ),
        interaction.options.getFocused()
      )
    );
  } catch (error) {
    logger.error(
      `Failed to respond to company autocomplete interaction by ${interaction.user.tag}\n${error}`
    );
  }
};

// Interactions

const ignoredButtons = ["help", "polls", "exp"];

export const handleChatInputCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  try {
    await interaction.deferReply();
  } catch (error) {
    logger.error(
      `Failed to defer reply for chat input command ${interaction} by ${interaction.user.tag}\n${error}`
    );
    await interaction.reply(
      "Настана грешка при извршување на командата. Обидете се повторно, или пријавете ја грешката."
    );
    return;
  }

  const command = await getCommand(interaction.commandName);

  logger.info(
    `[Chat] ${interaction.user.tag}: ${interaction} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? "DM"
        : "Guild"
    }]`
  );
  await log(
    await getChatInputCommandEmbed(interaction),
    interaction,
    "commands"
  );

  if (command === undefined) {
    logger.warn(
      `No command was found for the chat input command ${interaction} by ${interaction.user.tag}`
    );
    await interaction.editReply(errors.commandNotFound);
    return;
  }

  const fullCommand = (
    interaction.commandName +
    " " +
    (interaction.options.getSubcommand(false) ?? "")
  ).trim();

  if (
    !hasCommandPermission(interaction.member as GuildMember | null, fullCommand)
  ) {
    await interaction.editReply(errors.commandNoPermission);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      `Failed to handle chat input command ${interaction} by ${interaction.user.tag}\n${error}`
    );
  }
};

export const handleUserContextMenuCommand = async (
  interaction: UserContextMenuCommandInteraction
) => {
  try {
    await interaction.deferReply();
  } catch (error) {
    logger.error(
      `Failed to defer reply for user context menu command ${interaction.commandName} by ${interaction.user.tag}\n${error}`
    );
    await interaction.reply(
      "Настана грешка при извршување на командата. Обидете се повторно, или пријавете ја грешката."
    );
    return;
  }

  const command = await getCommand(interaction.commandName);

  logger.info(
    `[User] ${interaction.user.tag}: ${interaction.commandName} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? "DM"
        : "Guild"
    }]`
  );
  await log(
    await getUserContextMenuCommandEmbed(interaction),
    interaction,
    "commands"
  );

  if (command === undefined) {
    logger.warn(
      `No command was found for the user context menu command ${interaction.commandName} by ${interaction.user.tag}`
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      `Failed to handle user context menu command ${interaction.commandName} by ${interaction.user.tag}\n${error}`
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

export const handleButton = async (interaction: ButtonInteraction) => {
  const [command, ...args] = interaction.customId.split(":");

  logger.info(
    `[Button] ${interaction.user.tag}: ${interaction.customId} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? "DM"
        : "Guild"
    }]`
  );
  await log(
    getButtonEmbed(interaction, command, args),
    interaction,
    "commands"
  );

  if (command === undefined) {
    logger.warn(
      `Received bad button interaction ${interaction.customId} by ${interaction.user.tag}`
    );
    return;
  }

  if (command === "removeCourses" || command === "addCourses") {
    try {
      const mess = await interaction.deferReply({ ephemeral: true });
      void deleteResponse(mess, 10_000);
    } catch (error) {
      logger.error(
        `Failed to defer reply for button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`
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
    logger.warn(
      `Received unknown button interaction ${interaction.customId} by ${interaction.user.tag}`
    );
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
  interaction: AutocompleteInteraction
) => {
  const option = interaction.options.getFocused(true);

  logger.info(
    `[Auto] ${interaction.user.tag}: ${option.name} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? "DM"
        : "Guild"
    }]`
  );
  await log(getAutocompleteEmbed(interaction), interaction, "commands");

  if (Object.keys(autocompleteInteractionHandlers).includes(option.name)) {
    await autocompleteInteractionHandlers[
      option.name as keyof typeof autocompleteInteractionHandlers
    ](interaction);
  } else {
    logger.warn(
      `Received unknown autocomplete interaction ${option.name} by ${interaction.user.tag}`
    );
  }
};
