import { getVipEmbed, getVipInvitedEmbed } from "@app/components/commands.js";
import { getPaginationComponents } from "@app/components/pagination.js";
import {
  getPollComponents,
  getPollEmbed,
  getPollStatsComponents,
  getSpecialPollListFirstPageEmbed,
  getSpecialPollListNextPageEmbed,
} from "@app/components/polls.js";
import { deletePoll, getPollById, updatePoll } from "@app/data/Poll.js";
import { getPollVotesByPollId } from "@app/data/PollVote.js";
import {
  deleteSpecialPoll,
  getSpecialPollById,
  getSpecialPollByPollId,
  getSpecialPollByUserAndType,
  getSpecialPolls,
} from "@app/data/SpecialPoll.js";
import { getVipBanByUserId, getVipBans } from "@app/data/VipBan.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from "@app/translations/commands.js";
import { logErrorFunctions } from "@app/translations/logs.js";
import { deleteResponse } from "@app/utils/channels.js";
import { getConfigProperty, getRoleProperty } from "@app/utils/config.js";
import { handlePollButtonForVipVote } from "@app/utils/interactions.js";
import { logger } from "@app/utils/logger.js";
import {
  isMemberAdmin,
  isMemberInCouncil,
  isMemberInVip,
  isMemberInvitedToVip,
} from "@app/utils/members.js";
import {
  createPollChoices,
  specialPollOptions,
  specialPollTypes,
  startSpecialPoll,
} from "@app/utils/polls.js";
import { getMembersWithRoles } from "@app/utils/roles.js";
import {
  type ChatInputCommandInteraction,
  ComponentType,
  roleMention,
  SlashCommandBuilder,
  userMention,
} from "discord.js";

const name = "vip";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("VIP")
  .addSubcommand((command) =>
    command
      .setName("members")
      .setDescription(commandDescriptions["vip members"]),
  )
  .addSubcommand((command) =>
    command
      .setName("add")
      .setDescription(commandDescriptions["vip add"])
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Предлог корисник за член на ВИП")
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("remove")
      .setDescription(commandDescriptions["vip remove"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Член на ВИП").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("upgrade")
      .setDescription(commandDescriptions["vip upgrade"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("override")
      .setDescription(commandDescriptions["vip override"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Тип на анкета")
          .setRequired(true)
          .addChoices(...createPollChoices(specialPollTypes)),
      )
      .addStringOption((option) =>
        option
          .setName("decision")
          .setDescription("Одлука")
          .setRequired(true)
          .addChoices(...createPollChoices(specialPollOptions)),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("delete")
      .setDescription(commandDescriptions["vip delete"])
      .addStringOption((option) =>
        option.setName("poll").setDescription("Анкета").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("remaining")
      .setDescription(commandDescriptions["vip remaining"])
      .addStringOption((option) =>
        option.setName("poll").setDescription("Анкета").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("invited")
      .setDescription(commandDescriptions["vip invited"]),
  )
  .addSubcommand((command) =>
    command
      .setName("invite")
      .setDescription(commandDescriptions["vip invite"])
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Предлог корисник за покана")
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command.setName("list").setDescription(commandDescriptions["vip list"]),
  )
  .addSubcommand((command) =>
    command
      .setName("ban")
      .setDescription(commandDescriptions["vip ban"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command.setName("bans").setDescription(commandDescriptions["vip bans"]),
  )
  .addSubcommand((command) =>
    command
      .setName("unban")
      .setDescription(commandDescriptions["vip unban"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true),
      ),
  );

const handleVipMembers = async (interaction: ChatInputCommandInteraction) => {
  const embeds = await getVipEmbed(interaction);
  await interaction.editReply({
    embeds,
  });
};

const handleVipAdd = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);

  if (user.bot) {
    await interaction.editReply(commandErrors.userBot);

    return;
  }

  const vipBan = await getVipBanByUserId(user.id);

  if (vipBan !== null) {
    await interaction.editReply(commandErrors.userVipBanned);

    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id,
  );

  if (member === undefined) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  if (!(await isMemberInvitedToVip(member))) {
    await interaction.editReply(commandErrors.userNotVipInvited);

    return;
  }

  const existingPoll = await getSpecialPollByUserAndType(user.id, "vipAdd");

  if (existingPoll !== null) {
    await interaction.editReply(commandErrors.userVipPending);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, "vipAdd", 0.67);

  if (pollId === null) {
    await interaction.editReply(commandErrors.pollCreationFailed);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.channel?.send(
    roleMention(await getRoleProperty("council")),
  );
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel?.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const handleVipRemove = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);

  if (user.bot) {
    await interaction.editReply(commandErrors.userBot);

    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id,
  );

  if (member === undefined) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userAdmin);

    return;
  }

  if (!(await isMemberInVip(member))) {
    await interaction.editReply(commandErrors.userNotVipMember);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, "vipRemove", 0.67);

  if (pollId === null) {
    await interaction.editReply(commandErrors.userVipPending);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.channel?.send(
    roleMention(await getRoleProperty("council")),
  );
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel?.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const handleVipUpgrade = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);

  if (user.bot) {
    await interaction.editReply(commandErrors.userBot);

    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id,
  );

  if (member === undefined) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userAdmin);

    return;
  }

  if (!(await isMemberInVip(member))) {
    await interaction.editReply(commandErrors.userNotVipMember);

    return;
  }

  if (await isMemberInCouncil(member)) {
    await interaction.editReply(commandErrors.userFullVipMember);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, "vipUpgrade", 0.5);

  if (pollId === null) {
    await interaction.editReply(commandErrors.userVipPending);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.channel?.send(
    roleMention(await getRoleProperty("council")),
  );
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel?.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const handleVipOverride = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const type = interaction.options.getString("type", true);
  const decision = interaction.options.getString("decision", true);

  const specialPoll = await getSpecialPollByUserAndType(user.id, type);
  const poll = await getPollById(specialPoll?.pollId);

  if (specialPoll === null || poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  poll.done = true;
  poll.decision = decision;

  await updatePoll(poll);

  const member = interaction.guild?.members.cache.get(specialPoll.userId);

  if (member === undefined) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  await handlePollButtonForVipVote(poll, member);

  await interaction.editReply(commandResponses.pollOverriden);
};

const handleVipDelete = async (interaction: ChatInputCommandInteraction) => {
  const pollId = interaction.options.getString("poll", true);

  const specialPoll =
    (await getSpecialPollByPollId(pollId)) ??
    (await getSpecialPollById(pollId));

  if (specialPoll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const deletedSpecialPoll = await deleteSpecialPoll(specialPoll.id);
  const deletedPoll = await deletePoll(specialPoll.pollId);

  if (deletedSpecialPoll === null || deletedPoll === null) {
    await interaction.editReply(commandErrors.pollDeletionFailed);

    return;
  }

  await interaction.editReply(commandResponses.pollDeleted);
};

const handleVipRemaining = async (interaction: ChatInputCommandInteraction) => {
  const pollId = interaction.options.getString("poll", true);
  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const specialPoll = await getSpecialPollByPollId(pollId);

  if (specialPoll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const votes = await getPollVotesByPollId(pollId);

  if (votes === null) {
    await interaction.editReply(commandErrors.pollVotesFetchFailed);

    return;
  }

  const voters = votes.map((vote) => vote.userId);
  const allVoters = await getMembersWithRoles(interaction.guild, ...poll.roles);

  await interaction.editReply({
    allowedMentions: {
      parse: [],
    },
    content: allVoters
      .filter((voter) => !voters.includes(voter))
      .map((voter) => userMention(voter))
      .join(", "),
  });
};

const handleVipInvited = async (interaction: ChatInputCommandInteraction) => {
  const embed = await getVipInvitedEmbed();
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleVipInvite = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const member = interaction.guild?.members.cache.get(user.id);

  if (member === undefined) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  const vipBan = await getVipBanByUserId(user.id);

  if (vipBan !== null) {
    await interaction.editReply(commandErrors.userVipBanned);

    return;
  }

  if (await isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  if (await isMemberInvitedToVip(member)) {
    await interaction.editReply(commandErrors.userVipInvited);

    return;
  }

  const regularRole = await getRoleProperty("regular");
  await member.roles.add(regularRole);

  await interaction.editReply(commandResponses.userGivenRegular);
};

const handleVipList = async (interaction: ChatInputCommandInteraction) => {
  const specialPolls = await getSpecialPolls();

  if (specialPolls === null) {
    await interaction.editReply(commandErrors.specialPollsFetchFailed);

    return;
  }

  const pollsPerPage = 8;
  const pages = Math.ceil(specialPolls.length / pollsPerPage);
  const embed = await getSpecialPollListFirstPageEmbed(
    specialPolls,
    pollsPerPage,
  );
  const components = [
    pages === 0 || pages === 1
      ? getPaginationComponents("polls")
      : getPaginationComponents("polls", "start"),
  ];
  const message = await interaction.editReply({
    components,
    embeds: [embed],
  });
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: await getConfigProperty("buttonIdleTime"),
  });

  collector.on("collect", async (buttonInteraction) => {
    if (
      buttonInteraction.user.id !==
      buttonInteraction.message.interaction?.user.id
    ) {
      const mess = await buttonInteraction.reply({
        content: commandErrors.buttonNoPermission,
        ephemeral: true,
      });
      void deleteResponse(mess);

      return;
    }

    const id = buttonInteraction.customId.split(":")[1];

    if (id === undefined) {
      return;
    }

    let buttons;
    let page =
      Number(
        buttonInteraction.message.embeds[0]?.footer?.text?.match(/\d+/gu)?.[0],
      ) - 1;

    if (id === "first") {
      page = 0;
    } else if (id === "last") {
      page = pages - 1;
    } else if (id === "previous") {
      page--;
    } else if (id === "next") {
      page++;
    }

    if (page === 0 && (pages === 0 || pages === 1)) {
      buttons = getPaginationComponents("polls");
    } else if (page === 0) {
      buttons = getPaginationComponents("polls", "start");
    } else if (page === pages - 1) {
      buttons = getPaginationComponents("polls", "end");
    } else {
      buttons = getPaginationComponents("polls", "middle");
    }

    const nextEmbed = await getSpecialPollListNextPageEmbed(
      specialPolls,
      page,
      pollsPerPage,
    );

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(
        logErrorFunctions.interactionUpdateError(
          buttonInteraction.customId,
          error,
        ),
      );
    }
  });

  collector.on("end", async () => {
    try {
      await message.edit({
        components: [getPaginationComponents("polls")],
      });
    } catch (error) {
      logger.error(logErrorFunctions.collectorEndError(name, error));
    }
  });
};

const handleVipBan = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);

  if (user.bot) {
    await interaction.editReply(commandErrors.userBot);

    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id,
  );

  if (member === undefined) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userAdmin);

    return;
  }

  if (await isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, "vipBan", 0.67);

  if (pollId === null) {
    await interaction.editReply(commandErrors.userVipPending);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.channel?.send(
    roleMention(await getRoleProperty("council")),
  );
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel?.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const handleVipBans = async (interaction: ChatInputCommandInteraction) => {
  const vipBans = await getVipBans();

  if (vipBans === null) {
    await interaction.editReply(commandErrors.vipBansFetchFailed);

    return;
  }

  if (vipBans.length === 0) {
    await interaction.editReply(commandResponses.noVipBanned);

    return;
  }

  await interaction.editReply({
    allowedMentions: {
      parse: [],
    },
    content: vipBans.map(({ userId }) => userMention(userId)).join(", "),
  });
};

const handleVipUnban = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const vipBan = await getVipBanByUserId(user.id);

  if (vipBan === null) {
    await interaction.editReply(commandErrors.userNotVipBanned);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, "vipUnban", 0.67);

  if (pollId === null) {
    await interaction.editReply(commandErrors.userVipPending);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.channel?.send(
    roleMention(await getRoleProperty("council")),
  );
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel?.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const vipHandlers = {
  add: handleVipAdd,
  ban: handleVipBan,
  bans: handleVipBans,
  delete: handleVipDelete,
  invite: handleVipInvite,
  invited: handleVipInvited,
  list: handleVipList,
  members: handleVipMembers,
  override: handleVipOverride,
  remaining: handleVipRemaining,
  remove: handleVipRemove,
  unban: handleVipUnban,
  upgrade: handleVipUpgrade,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    await interaction.editReply({
      content: commandErrors.serverOnlyCommand,
    });

    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand in vipHandlers) {
    await vipHandlers[subcommand as keyof typeof vipHandlers](interaction);
  }
};
