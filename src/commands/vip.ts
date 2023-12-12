import {
  getPollComponents,
  getPollEmbed,
  getPollStatsComponents,
} from "../components/polls.js";
import { getPollById } from "../data/Poll.js";
import { getSpecialPollByUserAndType } from "../data/SpecialPoll.js";
import { getVipBanByUserId } from "../data/VipBan.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from "../translations/commands.js";
import { recreateVipTemporaryChannel } from "../utils/channels.js";
import { getRoleProperty } from "../utils/config.js";
import {
  isMemberAdmin,
  isMemberInCouncil,
  isMemberInVip,
  isMemberInvitedToVip,
} from "../utils/members.js";
import { startSpecialPoll } from "../utils/polls.js";
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
} from "discord.js";

const name = "vip";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("VIP")
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
      .setName("ban")
      .setDescription(commandDescriptions["vip ban"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("unban")
      .setDescription(commandDescriptions["vip unban"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("recreate")
      .setDescription(commandDescriptions["vip recreate"]),
  );

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
    await interaction.editReply(commandErrors.userNotRegular);

    return;
  }

  const existingPoll = await getSpecialPollByUserAndType(user.id, "vipAdd");

  if (existingPoll !== null) {
    await interaction.editReply(commandErrors.userVipPending);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, "vipAdd");

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

  const pollId = await startSpecialPoll(interaction, user, "vipRemove");

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

  const pollId = await startSpecialPoll(interaction, user, "vipUpgrade");

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

  const pollId = await startSpecialPoll(interaction, user, "vipBan");

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

const handleVipUnban = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const vipBan = await getVipBanByUserId(user.id);

  if (vipBan === null) {
    await interaction.editReply(commandErrors.userNotVipBanned);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, "vipUnban");

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

const handleVipRecreate = async (interaction: ChatInputCommandInteraction) => {
  await recreateVipTemporaryChannel();

  await interaction.editReply(commandResponses.temporaryVipChannelRecreated);
};

const vipHandlers = {
  add: handleVipAdd,
  ban: handleVipBan,
  recreate: handleVipRecreate,
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
