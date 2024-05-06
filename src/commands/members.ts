import { getBars } from '../data/Bar.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from '../translations/commands.js';
import { labels } from '../translations/labels.js';
import { formatUsers } from '../translations/users.js';
import { getRoleProperty } from '../utils/config.js';
import { getGuild, getMemberFromGuild } from '../utils/guild.js';
import { safeReplyToInteraction } from '../utils/messages.js';
import {
  getMembersByRoleIds,
  getMembersByRoleIdsExtended,
} from '../utils/roles.js';
import { isNotNullish } from '../utils/utils.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'members';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Members')
  .addSubcommand((command) =>
    command
      .setName('count')
      .setDescription(commandDescriptions['members count']),
  )
  .addSubcommand((command) =>
    command.setName('vip').setDescription(commandDescriptions['members vip']),
  )
  .addSubcommand((command) =>
    command
      .setName('regulars')
      .setDescription(commandDescriptions['members regulars']),
  )
  .addSubcommand((command) =>
    command
      .setName('girlies')
      .setDescription(commandDescriptions['members girlies']),
  )
  .addSubcommand((command) =>
    command.setName('boys').setDescription(commandDescriptions['members boys']),
  )
  .addSubcommand((command) =>
    command
      .setName('barred')
      .setDescription(commandDescriptions['members barred']),
  )
  .addSubcommand((command) =>
    command
      .setName('boosters')
      .setDescription(commandDescriptions['members boosters']),
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

  const vipRoleId = await getRoleProperty('vip');
  const vipMemberIds = await getMembersByRoleIds(guild, [vipRoleId]);
  const vipMembers = (
    await Promise.all(
      vipMemberIds.map(async (id) => await getMemberFromGuild(id, interaction)),
    )
  ).filter(isNotNullish);
  const vipMembersFormatted = formatUsers(
    labels.vip,
    vipMembers.map(({ user }) => user),
  );

  const adminRoleId = await getRoleProperty('admin');
  const moderatorRoleId = await getRoleProperty('moderator');
  const adminTeamMemberIds = await getMembersByRoleIds(guild, [
    adminRoleId,
    moderatorRoleId,
  ]);
  const adminTeamMembers = (
    await Promise.all(
      adminTeamMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction),
      ),
    )
  ).filter(isNotNullish);
  const adminTeamMembersFormatted = formatUsers(
    labels.administration,
    adminTeamMembers.map(({ user }) => user),
  );

  const veteranRoleId = await getRoleProperty('veteran');
  const veteranMemberIds = await getMembersByRoleIds(guild, [veteranRoleId]);
  const veteranMembers = (
    await Promise.all(
      veteranMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction),
      ),
    )
  ).filter(isNotNullish);
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

  const regularRoleId = await getRoleProperty('regular');
  const vipRoleId = await getRoleProperty('vip');
  const moderatorRoleId = await getRoleProperty('moderator');
  const adminRoleId = await getRoleProperty('admin');
  const veteranRoleId = await getRoleProperty('veteran');

  const invitedMemberIds = await getMembersByRoleIdsExtended(
    guild,
    [regularRoleId],
    [vipRoleId, moderatorRoleId, adminRoleId, veteranRoleId],
  );
  const invitedMembers = (
    await Promise.all(
      invitedMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction),
      ),
    )
  ).filter(isNotNullish);
  const invitedMemberNames = formatUsers(
    labels.regulars,
    invitedMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, invitedMemberNames);
};

const handleMembersGirlies = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const girliesRoleId = await getRoleProperty('girlies');
  const girliesMemberIds = await getMembersByRoleIds(guild, [girliesRoleId]);

  const girliesMembers = (
    await Promise.all(
      girliesMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction),
      ),
    )
  ).filter(isNotNullish);
  const girliesMembersFormatted = formatUsers(
    labels.girlies,
    girliesMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, girliesMembersFormatted);
};

const handleMembersBoys = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const boysRoleId = await getRoleProperty('boys');
  const boysMemberIds = await getMembersByRoleIds(guild, [boysRoleId]);

  const boysMembers = (
    await Promise.all(
      boysMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction),
      ),
    )
  ).filter(isNotNullish);
  const boysMembersFormatted = formatUsers(
    labels.boys,
    boysMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, boysMembersFormatted);
};

const handleMembersBarred = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const bars = await getBars();

  if (bars === null) {
    await interaction.editReply(commandErrors.barsFetchFailed);

    return;
  }

  if (bars.length === 0) {
    await interaction.editReply(commandResponses.noBarred);

    return;
  }

  const barredMembers = (
    await Promise.all(
      bars
        .map(({ userId }) => userId)
        .map(async (id) => await getMemberFromGuild(id, interaction)),
    )
  ).filter(isNotNullish);
  const bannedMembersFormatted = formatUsers(
    labels.barred,
    barredMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, bannedMembersFormatted);
};

const handleMembersBoosters = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const boosterRoleId = await getRoleProperty('booster');
  const boosterMemberIds = await getMembersByRoleIds(guild, [boosterRoleId]);

  const boosterMembers = (
    await Promise.all(
      boosterMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction),
      ),
    )
  ).filter(isNotNullish);
  const boosterMembersFormatted = formatUsers(
    labels.boosters,
    boosterMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, boosterMembersFormatted);
};

const membersHandlers = {
  barred: handleMembersBarred,
  boosters: handleMembersBoosters,
  boys: handleMembersBoys,
  count: handleMembersCount,
  girlies: handleMembersGirlies,
  regulars: handleMembersRegulars,
  vip: handleMembersVip,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand in membersHandlers) {
    await membersHandlers[subcommand as keyof typeof membersHandlers](
      interaction,
    );
  }
};
