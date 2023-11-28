import { client } from "./client.js";
import { getConfigProperty } from "./config.js";
import { logger } from "./logger.js";
import {
  logErrorFunctions,
  logMessageFunctions,
  logMessages,
  vipStringFunctions,
} from "./strings.js";
import { type ChannelName } from "@app/types/ChannelName.js";
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

const channels: {
  [K in ChannelName]?: GuildTextBasedChannel | undefined;
} = {};

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

const getNextVipCronRun = async (locale: string = "en-GB", offset = 1) => {
  const { cron } = await getConfigProperty("temporaryVIPChannel");
  const nextRun = Cron(cron).nextRuns(offset).at(-1);

  return nextRun === null
    ? "?"
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeStyle: "long",
      }).format(nextRun);
};

export const scheduleVipTemporaryChannel = async () => {
  const { cron, name, parent } = await getConfigProperty("temporaryVIPChannel");
  const guildId = await getConfigProperty("guild");

  Cron(cron, async () => {
    const existingChannel = client.channels.cache.find(
      (ch) => ch.type !== ChannelType.DM && ch.name === name,
    );

    if (existingChannel !== undefined) {
      await existingChannel.delete();
    }

    const guild = client.guilds.cache.get(guildId);

    if (guild === undefined) {
      return;
    }

    const channel = await guild.channels.create({
      name,
      parent,
      topic: vipStringFunctions.tempVipTopic(
        await getNextVipCronRun("mk-MK", 2),
      ),
      type: ChannelType.GuildText,
    });
    await channel.setPosition(
      (await getConfigProperty("temporaryVIPChannel")).position,
      {
        relative: true,
      },
    );

    logger.info(
      logMessageFunctions.tempVipScheduled(await getNextVipCronRun()),
    );
  });

  logger.info(logMessageFunctions.tempVipScheduled(await getNextVipCronRun()));
};

export const log = async (
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
