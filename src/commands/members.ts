import { getVipBans } from "../data/VipBan.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from "../translations/commands.js";
import { labels } from "../translations/labels.js";
import { formatUsers } from "../translations/users.js";
import { getRoleProperty } from "../utils/config.js";
import { getGuild } from "../utils/guild.js";
import { safeReplyToInteraction } from "../utils/messages.js";
import {
  getMembersByRoleIds,
  getMembersByRoleIdsExtended,
} from "../utils/roles.js";
import { isNotNullish } from "../utils/utils.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "members";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Members")
  .addSubcommand((command) =>
    command
      .setName("count")
      .setDescription(commandDescriptions["members count"]),
  )
  .addSubcommand((command) =>
    command.setName("vip").setDescription(commandDescriptions["members vip"]),
  )
  .addSubcommand((command) =>
    command
      .setName("regulars")
      .setDescription(commandDescriptions["members regulars"]),
  )
  .addSubcommand((command) =>
    command
      .setName("vipbanned")
      .setDescription(commandDescriptions["members vipbanned"]),
  );

const handleMembersCount = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  await interaction.editReply(
    commandResponseFunctions.serverMembers(guild?.memberCount),
  );
};

const handleMembersVip = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  await interaction.guild?.members.fetch();

  const vipRoleId = await getRoleProperty("vip");
  const vipMemberIds = await getMembersByRoleIds(guild, [vipRoleId]);
  const vipMembers = vipMemberIds
    .map((id) => interaction.guild?.members.cache.get(id))
    .filter(isNotNullish);
  const vipMembersFormatted = formatUsers(
    labels.vip,
    vipMembers.map(({ user }) => user),
  );

  const adminRoleId = await getRoleProperty("admin");
  const moderatorRoleId = await getRoleProperty("moderator");
  const adminTeamMemberIds = await getMembersByRoleIds(guild, [
    adminRoleId,
    moderatorRoleId,
  ]);
  const adminTeamMembers = adminTeamMemberIds
    .map((id) => interaction.guild?.members.cache.get(id))
    .filter(isNotNullish);
  const adminTeamMembersFormatted = formatUsers(
    labels.administration,
    adminTeamMembers.map(({ user }) => user),
  );

  const veteranRoleId = await getRoleProperty("veteran");
  const veteranMemberIds = await getMembersByRoleIds(guild, [veteranRoleId]);
  const veteranMembers = veteranMemberIds
    .map((id) => interaction.guild?.members.cache.get(id))
    .filter(isNotNullish);
  const veteranMembersFormatted = formatUsers(
    labels.veterans,
    veteranMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(
    interaction,
    `${vipMembersFormatted}\n${adminTeamMembersFormatted}\n${veteranMembersFormatted}`,
  );
};

const handleMembersRegulars = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  await interaction.guild?.members.fetch();

  const regularRoleId = await getRoleProperty("regular");
  const vipRoleId = await getRoleProperty("vip");
  const moderatorRoleId = await getRoleProperty("moderator");
  const adminRoleId = await getRoleProperty("admin");
  const veteranRoleId = await getRoleProperty("veteran");

  const invitedMemberIds = await getMembersByRoleIdsExtended(
    guild,
    [regularRoleId],
    [vipRoleId, moderatorRoleId, adminRoleId, veteranRoleId],
  );
  const invitedMembers = invitedMemberIds
    .map((id) => interaction.guild?.members.cache.get(id))
    .filter(isNotNullish);
  const invitedMemberNames = formatUsers(
    labels.regulars,
    invitedMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, invitedMemberNames);
};

const handleMembersVipBanned = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const vipBans = await getVipBans();

  if (vipBans === null) {
    await interaction.editReply(commandErrors.vipBansFetchFailed);

    return;
  }

  if (vipBans.length === 0) {
    await interaction.editReply(commandResponses.noVipBanned);

    return;
  }

  const bannedMembers = vipBans
    .map(({ userId }) => userId)
    .map((id) => interaction.guild?.members.cache.get(id))
    .filter(isNotNullish);
  const bannedMembersFormatted = formatUsers(
    labels.vipBanned,
    bannedMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, bannedMembersFormatted);
};

const membersHandlers = {
  count: handleMembersCount,
  regulars: handleMembersRegulars,
  vip: handleMembersVip,
  vipbanned: handleMembersVipBanned,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand in membersHandlers) {
    await membersHandlers[subcommand as keyof typeof membersHandlers](
      interaction,
    );
  }
};
