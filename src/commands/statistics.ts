import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
} from 'discord.js';

import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import {
  getMaxEmojisByBoostLevel,
  getMaxStickersByBoostLevel,
} from '../utils/boost.js';
import { getGuild } from '../utils/guild.js';
import { safeReplyToInteraction } from '../utils/messages.js';
import { getRoles } from '../utils/roles.js';

const name = 'statistics';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Color')
  .addSubcommand((command) =>
    command
      .setName('color')
      .setDescription(commandDescriptions['statistics color']),
  )
  .addSubcommand((command) =>
    command
      .setName('program')
      .setDescription(commandDescriptions['statistics program']),
  )
  .addSubcommand((command) =>
    command
      .setName('year')
      .setDescription(commandDescriptions['statistics year']),
  )
  .addSubcommand((command) =>
    command
      .setName('course')
      .setDescription(commandDescriptions['statistics course']),
  )
  .addSubcommand((command) =>
    command
      .setName('notification')
      .setDescription(commandDescriptions['statistics notification']),
  )
  .addSubcommand((command) =>
    command
      .setName('server')
      .setDescription(commandDescriptions['statistics server']),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  await guild.members.fetch();

  const subcommand = interaction.options.getSubcommand(true);

  if (
    subcommand === 'color' ||
    subcommand === 'program' ||
    subcommand === 'year' ||
    subcommand === 'course' ||
    subcommand === 'notification'
  ) {
    const roles = getRoles(
      guild,
      subcommand === 'course' ? 'courses' : subcommand,
    );
    roles.sort((a, b) => b.members.size - a.members.size);
    const output = roles.map(
      (role) => `${roleMention(role.id)}: ${role.members.size}`,
    );

    await safeReplyToInteraction(interaction, output.join('\n'));
  } else {
    const boostLevel = guild.premiumTier;

    await guild.channels.fetch();
    await guild.roles.fetch();
    await guild.emojis.fetch();
    await guild.stickers.fetch();
    await guild.invites.fetch();

    const output = [
      commandResponseFunctions.serverMembersStat(
        guild.memberCount,
        guild.maximumMembers,
      ),
      commandResponseFunctions.serverBoostStat(
        guild.premiumSubscriptionCount ?? 0,
      ),
      commandResponseFunctions.serverBoostLevelStat(guild.premiumTier),
      commandResponseFunctions.serverChannelsStat(
        guild.channels.cache.filter((channel) => !channel.isThread()).size,
      ),
      commandResponseFunctions.serverRolesStat(guild.roles.cache.size),
      commandResponseFunctions.serverEmojiStat(
        guild.emojis.cache.filter((emoji) => !emoji.animated).size,
        getMaxEmojisByBoostLevel(boostLevel),
      ),
      commandResponseFunctions.serverAnimatedEmojiStat(
        guild.emojis.cache.filter((emoji) => emoji.animated).size,
        getMaxEmojisByBoostLevel(boostLevel),
      ),
      commandResponseFunctions.serverStickersStat(
        guild.stickers.cache.size,
        getMaxStickersByBoostLevel(boostLevel),
      ),
      commandResponseFunctions.serverInvitesStat(guild.invites.cache.size),
    ];

    await interaction.editReply(output.join('\n'));
  }
};
