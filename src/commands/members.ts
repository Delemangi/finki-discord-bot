/* eslint-disable unicorn/no-await-expression-member */

import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { getRolesProperty } from '../configuration/main.js';
import { getBars } from '../data/Bar.js';
import { Role } from '../lib/schemas/Role.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from '../translations/commands.js';
import { labels } from '../translations/labels.js';
import { formatUsers } from '../translations/users.js';
import { getGuild, getMemberFromGuild } from '../utils/guild.js';
import { safeReplyToInteraction } from '../utils/messages.js';
import {
  getMembersByRoleIds,
  getMembersByRoleIdsExtended,
} from '../utils/roles.js';

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
  )
  .addSubcommand((command) =>
    command
      .setName('irregulars')
      .setDescription(commandDescriptions['members irregulars']),
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

  const vipRoleId = getRolesProperty(Role.VIP);
  const adminRoleId = getRolesProperty(Role.Administrators);
  const moderatorRoleId = getRolesProperty(Role.Moderators);

  const vipMemberIds = await getMembersByRoleIdsExtended(
    guild,
    [vipRoleId].filter((value) => value !== undefined),
    [adminRoleId, moderatorRoleId].filter((value) => value !== undefined),
  );
  const vipMembers = (
    await Promise.all(
      vipMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction.guild),
      ),
    )
  ).filter((member) => member !== null);
  const vipMembersFormatted = formatUsers(
    labels.vip,
    vipMembers.map(({ user }) => user),
  );

  const adminTeamMemberIds = await getMembersByRoleIds(
    guild,
    [adminRoleId, moderatorRoleId].filter((value) => value !== undefined),
  );
  const adminTeamMembers = (
    await Promise.all(
      adminTeamMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction.guild),
      ),
    )
  ).filter((member) => member !== null);
  const adminTeamMembersFormatted = formatUsers(
    labels.administration,
    adminTeamMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(
    interaction,
    `${vipMembersFormatted}\n${adminTeamMembersFormatted}`,
    {
      mentionUsers: false,
    },
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

  const regularRoleId = getRolesProperty(Role.Regulars);
  const irregularRoleId = getRolesProperty(Role.Irregulars);
  const vipRoleId = getRolesProperty(Role.VIP);
  const moderatorRoleId = getRolesProperty(Role.Moderators);
  const adminRoleId = getRolesProperty(Role.Administrators);
  const veteranRoleId = getRolesProperty(Role.Veterans);

  const regularsMembersIds = await getMembersByRoleIdsExtended(
    guild,
    [regularRoleId].filter((value) => value !== undefined),
    [
      vipRoleId,
      moderatorRoleId,
      adminRoleId,
      veteranRoleId,
      irregularRoleId,
    ].filter((value) => value !== undefined),
  );
  const regularsMembers = (
    await Promise.all(
      regularsMembersIds.map(
        async (id) => await getMemberFromGuild(id, interaction.guild),
      ),
    )
  ).filter((member) => member !== null);
  const regularsMemberNames = formatUsers(
    labels.regulars,
    regularsMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, regularsMemberNames, {
    mentionUsers: false,
  });
};

const handleMembersGirlies = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const girliesRoleId = getRolesProperty(Role.Girlies);
  const girliesMemberIds = await getMembersByRoleIds(
    guild,
    [girliesRoleId].filter((value) => value !== undefined),
  );

  const girliesMembers = (
    await Promise.all(
      girliesMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction.guild),
      ),
    )
  ).filter((member) => member !== null);
  const girliesMembersFormatted = formatUsers(
    labels.girlies,
    girliesMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, girliesMembersFormatted, {
    mentionUsers: false,
  });
};

const handleMembersBoys = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const boysRoleId = getRolesProperty(Role.Boys);
  const boysMemberIds = await getMembersByRoleIds(
    guild,
    [boysRoleId].filter((value) => value !== undefined),
  );

  const boysMembers = (
    await Promise.all(
      boysMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction.guild),
      ),
    )
  ).filter((member) => member !== null);
  const boysMembersFormatted = formatUsers(
    labels.boys,
    boysMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, boysMembersFormatted, {
    mentionUsers: false,
  });
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
        .map(async (id) => await getMemberFromGuild(id, interaction.guild)),
    )
  ).filter((member) => member !== null);
  const bannedMembersFormatted = formatUsers(
    labels.barred,
    barredMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, bannedMembersFormatted, {
    mentionUsers: false,
  });
};

const handleMembersBoosters = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const boosterRoleId = getRolesProperty(Role.Boosters);
  const boosterMemberIds = await getMembersByRoleIds(
    guild,
    [boosterRoleId].filter((value) => value !== undefined),
  );

  const boosterMembers = (
    await Promise.all(
      boosterMemberIds.map(
        async (id) => await getMemberFromGuild(id, interaction.guild),
      ),
    )
  ).filter((member) => member !== null);
  const boosterMembersFormatted = formatUsers(
    labels.boosters,
    boosterMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, boosterMembersFormatted, {
    mentionUsers: false,
  });
};

const handleMembersIrregulars = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const irregularRoleId = getRolesProperty(Role.Irregulars);
  const vipRoleId = getRolesProperty(Role.VIP);

  const irregularsMembersIds = await getMembersByRoleIdsExtended(
    guild,
    [irregularRoleId].filter((value) => value !== undefined),
    [vipRoleId].filter((value) => value !== undefined),
  );
  const irregularsMembers = (
    await Promise.all(
      irregularsMembersIds.map(
        async (id) => await getMemberFromGuild(id, interaction.guild),
      ),
    )
  ).filter((member) => member !== null);
  const irregularsMemberNames = formatUsers(
    labels.irregulars,
    irregularsMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, irregularsMemberNames, {
    mentionUsers: false,
  });
};

const membersHandlers = {
  barred: handleMembersBarred,
  boosters: handleMembersBoosters,
  boys: handleMembersBoys,
  count: handleMembersCount,
  girlies: handleMembersGirlies,
  irregulars: handleMembersIrregulars,
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
