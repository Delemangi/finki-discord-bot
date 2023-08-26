import { deletePoll, getPollById, updatePoll } from "../data/Poll.js";
import { getPollVotesByPollId } from "../data/PollVote.js";
import {
  deleteVipPollByPollId,
  getVipPollById,
  getVipPollByUserAndType,
  getVipPolls,
} from "../data/VipPoll.js";
import { deleteResponse } from "../utils/channels.js";
import {
  getPaginationComponents,
  getPollComponents,
  getPollEmbed,
  getVipEmbed,
  getVipInvitedEmbed,
  getVipPollListFirstPageEmbed,
  getVipPollListNextPageEmbed,
} from "../utils/components.js";
import { getConfigProperty } from "../utils/config.js";
import { handlePollButtonForVipVote } from "../utils/interactions.js";
import { logger } from "../utils/logger.js";
import { startVipPoll } from "../utils/polls.js";
import { getMembersWithRoles, getRole } from "../utils/roles.js";
import { commandDescriptions, errors } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  ComponentType,
  PermissionFlagsBits,
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
      .setDescription(commandDescriptions["vip members"])
  )
  .addSubcommand((command) =>
    command
      .setName("add")
      .setDescription(commandDescriptions["vip add"])
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Предлог корисник за член на ВИП")
          .setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("remove")
      .setDescription(commandDescriptions["vip remove"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Член на ВИП").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("upgrade")
      .setDescription(commandDescriptions["vip upgrade"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("override")
      .setDescription(commandDescriptions["vip override"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Тип на анкета")
          .setRequired(true)
          .addChoices(
            ...["add", "remove", "upgrade", "forceAdd"].map((choice) => ({
              name: choice,
              value: choice,
            }))
          )
      )
      .addStringOption((option) =>
        option
          .setName("decision")
          .setDescription("Одлука")
          .setRequired(true)
          .addChoices(
            ...["Да", "Не"].map((choice) => ({ name: choice, value: choice }))
          )
      )
  )
  .addSubcommand((command) =>
    command
      .setName("delete")
      .setDescription(commandDescriptions["vip delete"])
      .addStringOption((option) =>
        option.setName("poll").setDescription("Анкета").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("remaining")
      .setDescription(commandDescriptions["vip remaining"])
      .addStringOption((option) =>
        option.setName("poll").setDescription("Анкета").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("invited")
      .setDescription(commandDescriptions["vip invited"])
  )
  .addSubcommand((command) =>
    command
      .setName("invite")
      .setDescription(commandDescriptions["vip invite"])
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Предлог корисник за покана")
          .setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command.setName("list").setDescription(commandDescriptions["vip list"])
  )
  .setDMPermission(false);

const handleVipMembers = async (interaction: ChatInputCommandInteraction) => {
  const embeds = await getVipEmbed(interaction);
  await interaction.editReply({ embeds });
};

const handleVipAdd = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);

  if (user.bot) {
    await interaction.editReply("Корисникот не смее да биде бот.");
    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id
  );

  if (member === undefined) {
    await interaction.editReply("Корисникот не е член на овој сервер.");
    return;
  }

  const vipRole = getRole("vip");
  const adminRole = getRole("admin");
  const vipInvitedRole = getRole("vipInvited");

  if (
    vipRole === undefined ||
    adminRole === undefined ||
    vipInvitedRole === undefined
  ) {
    await interaction.editReply(
      "Улогите за пристап до ВИП или не се конфигурирани или не постојат."
    );
    return;
  }

  if (
    member.roles.cache.has(vipRole.id) ||
    member.roles.cache.has(adminRole.id) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    await interaction.editReply("Корисникот е веќе член на ВИП.");
    return;
  }

  if (!member.roles.cache.has(vipInvitedRole.id)) {
    await interaction.editReply("Корисникот не е поканет да биде член на ВИП.");
    return;
  }

  const pollId = await startVipPoll(interaction, user, "forceAdd", 0.67);

  if (pollId === null) {
    await interaction.editReply("Веќе постои предлог за овој корисник.");
    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply("Таа анкета не постои.");
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.editReply({ components, embeds: [embed] });
};

const handleVipRemove = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);

  if (user.bot) {
    await interaction.editReply("Корисникот не смее да биде бот.");
    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id
  );

  if (member === undefined) {
    await interaction.editReply("Корисникот не е член на овој сервер.");
  }

  const vipRole = getRole("vip");
  const adminRole = getRole("admin");

  if (vipRole === undefined || adminRole === undefined) {
    await interaction.editReply(
      "Улогите за пристап до ВИП или не се конфигурирани или не постојат."
    );
    return;
  }

  if (
    member?.roles.cache.has(adminRole.id) ||
    member?.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    await interaction.editReply("Корисникот е администратор.");
    return;
  }

  if (!member?.roles.cache.has(vipRole.id)) {
    await interaction.editReply("Корисникот не е член на ВИП.");
    return;
  }

  const pollId = await startVipPoll(interaction, user, "remove", 0.67);

  if (pollId === null) {
    await interaction.editReply("Веќе постои предлог за овој корисник.");
    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply("Таа анкета не постои.");
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.editReply({ components, embeds: [embed] });
};

const handleVipUpgrade = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);

  if (user.bot) {
    await interaction.editReply("Корисникот не смее да биде бот.");
    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id
  );

  if (member === undefined) {
    await interaction.editReply("Корисникот не е член на овој сервер.");
    return;
  }

  const vipRole = getRole("vip");
  const vipVotingRole = getRole("vipVoting");
  const adminRole = getRole("admin");

  if (
    vipRole === undefined ||
    adminRole === undefined ||
    vipVotingRole === undefined
  ) {
    await interaction.editReply(
      "Улогите за пристап до ВИП или не се конфигурирани или не постојат."
    );
    return;
  }

  if (member.roles.cache.has(adminRole.id)) {
    await interaction.editReply("Корисникот е администратор.");
    return;
  }

  if (!member.roles.cache.has(vipRole.id)) {
    await interaction.editReply("Корисникот не е член на ВИП.");
    return;
  }

  if (member.roles.cache.has(vipVotingRole.id)) {
    await interaction.editReply("Корисникот е полноправен член на ВИП.");
    return;
  }

  const pollId = await startVipPoll(interaction, user, "upgrade", 0.5);

  if (pollId === null) {
    await interaction.editReply("Веќе постои предлог за овој корисник.");
    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply("Таа анкета не постои.");
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.editReply({ components, embeds: [embed] });
};

const handleVipOverride = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const type = interaction.options.getString("type", true);
  const decision = interaction.options.getString("decision", true);

  const vipPoll = await getVipPollByUserAndType(user.id, type);
  const poll = await getPollById(vipPoll?.pollId);

  if (vipPoll === null || poll === null) {
    await interaction.editReply("Не постои анкета за овој корисник.");
    return;
  }

  poll.done = true;
  poll.decision = decision;

  await updatePoll(poll);

  const member = interaction.guild?.members.cache.get(vipPoll.userId);

  if (member === undefined) {
    await interaction.editReply("Корисникот не е член на овој сервер.");
    return;
  }

  await handlePollButtonForVipVote(poll, member);

  await interaction.editReply("Успешно е затворена и спроведена анкетата.");
};

const handleVipDelete = async (interaction: ChatInputCommandInteraction) => {
  const pollId = interaction.options.getString("poll", true);

  const vipPoll = await getVipPollById(pollId);
  const poll = await getPollById(pollId);

  if (vipPoll === null || poll === null) {
    await interaction.editReply("Таа анкета не постои.");
    return;
  }

  await deleteVipPollByPollId(pollId);
  await deletePoll(pollId);

  await interaction.editReply("Успешно е избришана анкетата.");
};

const handleVipRemaining = async (interaction: ChatInputCommandInteraction) => {
  const pollId = interaction.options.getString("poll", true);
  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply("Таа анкета не постои.");
    return;
  }

  const vipPoll = await getVipPollById(pollId);

  if (vipPoll === null) {
    await interaction.editReply("Таа ВИП анкета не постои.");
    return;
  }

  const votes = await getPollVotesByPollId(pollId);
  const voters = votes.map((vote) => vote.userId);
  const allVoters = await getMembersWithRoles(interaction.guild, ...poll.roles);

  await interaction.editReply({
    allowedMentions: { parse: [] },
    content: allVoters
      .filter((voter) => !voters.includes(voter))
      .map((voter) => userMention(voter))
      .join(", "),
  });
};

const handleVipInvited = async (interaction: ChatInputCommandInteraction) => {
  const vipInvitedRole = getRole("vipInvited");
  const boosterRole = getRole("booster");
  const contributorRole = getRole("contributor");
  const adminRole = getRole("admin");
  const vipRole = getRole("vip");

  if (
    vipInvitedRole === undefined ||
    boosterRole === undefined ||
    contributorRole === undefined ||
    adminRole === undefined ||
    vipRole === undefined
  ) {
    await interaction.editReply(
      "Улогите за ВИП не се конфигурирани или не постојат."
    );
    return;
  }

  const embed = await getVipInvitedEmbed();
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleVipInvite = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const member = interaction.guild?.members.cache.get(user.id);

  if (member === undefined) {
    await interaction.editReply("Корисникот не е член на овој сервер.");
    return;
  }

  const vipInvitedRole = getRole("vipInvited");
  const boosterRole = getRole("booster");
  const contributorRole = getRole("contributor");
  const adminRole = getRole("admin");
  const vipRole = getRole("vip");

  if (
    vipInvitedRole === undefined ||
    boosterRole === undefined ||
    contributorRole === undefined ||
    adminRole === undefined ||
    vipRole === undefined
  ) {
    await interaction.editReply(
      "Улогите за ВИП не се конфигурирани или не постојат."
    );
    return;
  }

  if (
    member.roles.cache.has(vipRole.id) ||
    member.roles.cache.has(adminRole.id) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    await interaction.editReply("Корисникот е веќе член на ВИП.");
    return;
  }

  if (
    member.roles.cache.has(vipInvitedRole.id) ||
    member.roles.cache.has(boosterRole.id) ||
    member.roles.cache.has(contributorRole.id)
  ) {
    await interaction.editReply("Корисникот е веќе поканет за ВИП.");
    return;
  }

  await member.roles.add(vipInvitedRole.id);

  await interaction.editReply("Успешно е поканет корисникот за ВИП.");
};

const handleVipList = async (interaction: ChatInputCommandInteraction) => {
  const vipPolls = await getVipPolls();
  const pollsPerPage = 8;
  const pages = Math.ceil(vipPolls.length / pollsPerPage);
  const embed = await getVipPollListFirstPageEmbed(vipPolls, pollsPerPage);
  const components = [
    pages === 0 || pages === 1
      ? getPaginationComponents("polls")
      : getPaginationComponents("polls", "start"),
  ];
  const message = await interaction.editReply({ components, embeds: [embed] });
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
        content: "Ова не е ваша команда.",
        ephemeral: true,
      });
      void deleteResponse(mess);
      return;
    }

    const id = buttonInteraction.customId.split(":")[1];

    if (id === "undefined") {
      return;
    }

    let buttons;
    let page =
      Number(
        buttonInteraction.message.embeds[0]?.footer?.text?.match(/\d+/gu)?.[0]
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

    const nextEmbed = await getVipPollListNextPageEmbed(
      vipPolls,
      page,
      pollsPerPage
    );

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(`Failed to update poll list command\n${error}`);
    }
  });

  collector.on("end", async () => {
    try {
      await message.edit({
        components: [getPaginationComponents("polls")],
      });
    } catch (error) {
      logger.error(`Failed to update poll list command\n${error}`);
    }
  });
};

const vipHandlers = {
  add: handleVipAdd,
  delete: handleVipDelete,
  invite: handleVipInvite,
  invited: handleVipInvited,
  list: handleVipList,
  members: handleVipMembers,
  override: handleVipOverride,
  remaining: handleVipRemaining,
  remove: handleVipRemove,
  upgrade: handleVipUpgrade,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    await interaction.editReply({ content: errors.serverOnlyCommand });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand in vipHandlers) {
    await vipHandlers[subcommand as keyof typeof vipHandlers](interaction);
  }
};
