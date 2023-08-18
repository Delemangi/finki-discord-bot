import { type ChannelName } from "../types/ChannelName.js";
import { client } from "./client.js";
import { getConfigProperty } from "./config.js";
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

const channels: { [K in ChannelName]?: GuildTextBasedChannel | undefined } = {};

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
      channelId
    ) as GuildTextBasedChannel;
  }

  logger.info("Channels initialized");
};

export const getChannel = (type: ChannelName) => channels[type];

const getNextVipCronRun = async (locale: string = "en-GB", offset = 1) => {
  const { cron } = await getConfigProperty("temporaryVIPChannel");
  const nextRun = Cron(cron, {
    timezone: "CET",
  })
    .nextRuns(offset)
    .at(-1);
  return nextRun === null
    ? "?"
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "CET",
      }).format(nextRun);
};

export const scheduleVipTemporaryChannel = async () => {
  const { cron, name, parent } = await getConfigProperty("temporaryVIPChannel");
  const guildId = await getConfigProperty("guild");

  Cron(cron, { timezone: "CET" }, async () => {
    const existingChannel = client.channels.cache.find(
      (ch) => ch.type !== ChannelType.DM && ch.name === name
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
      topic: `Задните соби на ВИП. Следно бришење е во ${await getNextVipCronRun(
        "mk-MK",
        2
      )}`,
      type: ChannelType.GuildText,
    });
    await channel.setPosition(-1, { relative: true });

    logger.info(
      `Temporary VIP channel recreated. Next recreation is scheduled for ${await getNextVipCronRun()}`
    );
  });

  logger.info(
    `Temporary VIP channel recreation is scheduled for ${await getNextVipCronRun()}`
  );
};

export const log = async (
  embed: EmbedBuilder,
  interaction: Interaction,
  type: ChannelName
) => {
  const channel = channels[type];

  if (channel === undefined || !channel.isTextBased()) {
    return;
  }

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    logger.error(
      `Failed to send log for interaction ${interaction.id}\n${error}`
    );
  }
};

export const sendEmbed = async (
  channel: GuildTextBasedChannel,
  embed: EmbedBuilder,
  components: Array<ActionRowBuilder<ButtonBuilder>>,
  newlines?: number
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
  interval?: number
) => {
  const ephemeralReplyTime = await getConfigProperty("ephemeralReplyTime");

  await setTimeout(interval ?? ephemeralReplyTime);

  try {
    await message.delete();
  } catch (error) {
    logger.error(`Failed to delete message ${message.id}\n${error}`);
  }
};
