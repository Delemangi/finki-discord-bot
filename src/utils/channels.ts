import {
  getConfigProperty,
  getIntervalsProperty,
  getRolesProperty,
  getTemporaryChannelsProperty,
} from '../configuration/main.js';
import { labels } from '../translations/labels.js';
import {
  logErrorFunctions,
  logMessageFunctions,
  logMessages,
} from '../translations/logs.js';
import { specialStringFunctions } from '../translations/special.js';
import { type Channel, TemporaryChannel } from '../types/schemas/Channel.js';
import { Role } from '../types/schemas/Role.js';
import { client } from './client.js';
import { getGuild } from './guild.js';
import { logger } from './logger.js';
import { Cron } from 'croner';
import {
  type ActionRowBuilder,
  type ButtonBuilder,
  ChannelType,
  type EmbedBuilder,
  type GuildTextBasedChannel,
  type Interaction,
  type InteractionResponse,
  type Message,
  OverwriteType,
  PermissionFlagsBits,
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';

const channels: Partial<Record<Channel, GuildTextBasedChannel | undefined>> =
  {};

export const initializeChannels = async () => {
  const channelIds = await getConfigProperty('channels');

  if (channelIds === undefined) {
    return;
  }

  for (const [Channel, channelId] of Object.entries(channelIds)) {
    if (channelId === undefined) {
      continue;
    }

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel?.isTextBased() || channel.isDMBased()) {
        logger.warn(logMessageFunctions.channelNotGuildTextBased(channelId));
        return;
      }

      channels[Channel as Channel] = channel;
    } catch (error) {
      logger.error(logErrorFunctions.channelFetchError(channelId, error));
    }
  }

  logger.info(logMessages.channelsInitialized);
};

export const getChannel = (type: Channel) => {
  return channels[type];
};

const getNextRunTime = (date?: Date, locale = 'en-GB') => {
  if (date === undefined) {
    return labels.unknown;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date);
};

const getNextChannelRecreationTime = async (
  channelType: TemporaryChannel,
  locale = 'en-GB',
  offset = 1,
) => {
  const temporaryChannel = await getTemporaryChannelsProperty(channelType);

  if (temporaryChannel === undefined) {
    return labels.unknown;
  }

  const nextRun = new Cron(temporaryChannel.cron).nextRuns(offset).at(-1);

  return nextRun === null ? labels.unknown : getNextRunTime(nextRun, locale);
};

export const recreateVipTemporaryChannel = async () => {
  const guild = await getGuild();
  const temporaryChannel = await getTemporaryChannelsProperty(
    TemporaryChannel.VIP,
  );

  if (temporaryChannel === undefined) {
    return;
  }

  const existingChannel = client.channels.cache.find(
    (ch) => ch.type !== ChannelType.DM && ch.name === temporaryChannel.name,
  );

  if (existingChannel !== undefined) {
    await existingChannel.delete();
  }

  await guild?.channels.create({
    name: temporaryChannel.name,
    nsfw: true,
    parent: temporaryChannel.parent ?? null,
    topic: specialStringFunctions.tempVipTopic(
      await getNextChannelRecreationTime(TemporaryChannel.VIP, 'mk-MK'),
    ),
    type: ChannelType.GuildText,
  });

  logger.info(
    logMessageFunctions.tempVipScheduled(
      await getNextChannelRecreationTime(TemporaryChannel.VIP),
    ),
  );
};

export const recreateRegularsTemporaryChannel = async () => {
  const guild = await getGuild();
  const temporaryChannel = await getTemporaryChannelsProperty(
    TemporaryChannel.Regulars,
  );

  if (temporaryChannel === undefined) {
    return;
  }

  const existingChannel = client.channels.cache.find(
    (ch) => ch.type !== ChannelType.DM && ch.name === temporaryChannel.name,
  );

  if (existingChannel !== undefined) {
    await existingChannel.delete();
  }

  const administratorsRoleId = await getRolesProperty(Role.Administrators);
  const moderatorsRoleId = await getRolesProperty(Role.Moderators);
  const veteransRoleId = await getRolesProperty(Role.Veterans);
  const vipRoleId = await getRolesProperty(Role.VIP);
  const regularsRoleId = await getRolesProperty(Role.Regulars);

  const rolesToAdd = [
    administratorsRoleId,
    moderatorsRoleId,
    veteransRoleId,
    vipRoleId,
    regularsRoleId,
  ].filter((role) => role !== undefined);

  await guild?.channels.create({
    name: temporaryChannel.name,
    nsfw: true,
    parent: temporaryChannel.parent ?? null,
    permissionOverwrites: [
      ...rolesToAdd.map((role) => ({
        allow: [PermissionFlagsBits.ViewChannel],
        id: role,
        type: OverwriteType.Role,
      })),
      {
        deny: [PermissionFlagsBits.ViewChannel],
        id: guild?.roles.everyone.id,
        type: OverwriteType.Role,
      },
    ],
    topic: specialStringFunctions.tempRegularsTopic(
      await getNextChannelRecreationTime(TemporaryChannel.Regulars, 'mk-MK'),
    ),
    type: ChannelType.GuildText,
  });

  logger.info(
    logMessageFunctions.tempRegularsScheduled(
      await getNextChannelRecreationTime(TemporaryChannel.Regulars),
    ),
  );
};

export const resetTemporaryVipChannel = async () => {
  const temporaryChannel = await getTemporaryChannelsProperty(
    TemporaryChannel.VIP,
  );

  if (temporaryChannel === undefined) {
    return;
  }

  const cron = new Cron(temporaryChannel.cron, recreateVipTemporaryChannel);

  logger.info(
    logMessageFunctions.tempVipScheduled(
      getNextRunTime(cron.nextRuns(1).at(-1), 'mk-MK'),
    ),
  );
};

export const resetTemporaryRegularsChannel = async () => {
  const temporaryChannel = await getTemporaryChannelsProperty(
    TemporaryChannel.Regulars,
  );

  if (temporaryChannel === undefined) {
    return;
  }

  const cron = new Cron(
    temporaryChannel.cron,
    recreateRegularsTemporaryChannel,
  );

  logger.info(
    logMessageFunctions.tempRegularsScheduled(
      getNextRunTime(cron.nextRuns(1).at(-1), 'mk-MK'),
    ),
  );
};

export const logEmbed = async (
  embed: EmbedBuilder,
  interaction: Interaction,
  type: Channel,
) => {
  const channel = channels[type];

  if (!channel?.isTextBased()) {
    return;
  }

  try {
    await channel.send({
      embeds: [embed],
    });
  } catch (error) {
    logger.error(logErrorFunctions.interactionLogError(interaction.id, error));
  }
};

export const sendEmbed = async (
  channel: GuildTextBasedChannel,
  embed: EmbedBuilder,
  components: Array<ActionRowBuilder<ButtonBuilder>>,
  newlines?: number,
) => {
  return newlines === undefined || Number.isNaN(newlines)
    ? await channel.send({
        components,
        embeds: [embed],
      })
    : await channel.send({
        components,
        content: '_ _\n'.repeat(newlines),
        embeds: [embed],
      });
};

export const deleteResponse = async (
  message: InteractionResponse | Message,
  interval?: number,
) => {
  const ephemeralReplyInterval = await getIntervalsProperty('ephemeralReply');

  await setTimeout(interval ?? ephemeralReplyInterval);

  try {
    await message.delete();
  } catch (error) {
    logger.error(logErrorFunctions.responseDeleteError(message.id, error));
  }
};
