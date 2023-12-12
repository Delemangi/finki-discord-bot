import { labels } from "../translations/labels.js";
import {
  logErrorFunctions,
  logMessageFunctions,
  logMessages,
} from "../translations/logs.js";
import { vipStringFunctions } from "../translations/vip.js";
import { type ChannelName } from "../types/ChannelName.js";
import { client } from "./client.js";
import { getConfigProperty } from "./config.js";
import { getGuild } from "./guild.js";
import { logger } from "./logger.js";
import { Cron } from "croner";
import {
  type ActionRowBuilder,
  type ButtonBuilder,
  ChannelType,
  type EmbedBuilder,
  type GuildTextBasedChannel,
  type Interaction,
  type InteractionResponse,
  type Message,
} from "discord.js";
import { setTimeout } from "node:timers/promises";

const channels: Partial<
  Record<ChannelName, GuildTextBasedChannel | undefined>
> = {};

export const initializeChannels = async () => {
  const channelIds = await getConfigProperty("channels");

  if (channelIds === undefined) {
    return;
  }

  for (const [channelName, channelId] of Object.entries(channelIds)) {
    if (channelId === undefined) {
      continue;
    }

    channels[channelName as ChannelName] = client.channels.cache.get(
      channelId,
    ) as GuildTextBasedChannel;
  }

  logger.info(logMessages.channelsInitialized);
};

export const getChannel = (type: ChannelName) => channels[type];

const getNextVipCronRun = async (locale = "en-GB", offset = 1) => {
  const { cron } = await getConfigProperty("temporaryVIPChannel");
  const nextRun = Cron(cron).nextRuns(offset).at(-1);

  return nextRun === null
    ? labels.unknown
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeStyle: "long",
      }).format(nextRun);
};

export const recreateVipTemporaryChannel = async () => {
  const guild = await getGuild();
  const { name, parent, position } = await getConfigProperty(
    "temporaryVIPChannel",
  );

  const existingChannel = client.channels.cache.find(
    (ch) => ch.type !== ChannelType.DM && ch.name === name,
  );

  if (existingChannel !== undefined) {
    await existingChannel.delete();
  }

  const channel = await guild?.channels.create({
    name,
    parent,
    topic: vipStringFunctions.tempVipTopic(await getNextVipCronRun("mk-MK")),
    type: ChannelType.GuildText,
  });
  await channel?.setPosition(position, {
    relative: true,
  });

  logger.info(logMessageFunctions.tempVipScheduled(await getNextVipCronRun()));
};

export const scheduleVipTemporaryChannel = async () => {
  const { cron } = await getConfigProperty("temporaryVIPChannel");

  Cron(cron, recreateVipTemporaryChannel);

  logger.info(logMessageFunctions.tempVipScheduled(await getNextVipCronRun()));
};

export const logEmbed = async (
  embed: EmbedBuilder,
  interaction: Interaction,
  type: ChannelName,
) => {
  const channel = channels[type];

  if (channel === undefined || !channel.isTextBased()) {
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
        content: "_ _\n".repeat(newlines),
        embeds: [embed],
      });
};

export const deleteResponse = async (
  message: InteractionResponse | Message,
  interval?: number,
) => {
  const ephemeralReplyTime = await getConfigProperty("ephemeralReplyTime");

  await setTimeout(interval ?? ephemeralReplyTime);

  try {
    await message.delete();
  } catch (error) {
    logger.error(logErrorFunctions.responseDeleteError(message.id, error));
  }
};
