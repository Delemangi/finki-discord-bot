import { client } from './client.js';
import { getFromBotConfig } from './config.js';
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
} from 'discord.js';

const channels: { [K in Channels]?: GuildTextBasedChannel | undefined } = {};

export const initializeChannels = () => {
  const channelIds = getFromBotConfig('channels');

  if (channelIds === undefined) {
    return;
  }

  channels.commands = client.channels.cache.get(
    channelIds.commands,
  ) as GuildTextBasedChannel;
  channels.vip = client.channels.cache.get(
    channelIds.vip,
  ) as GuildTextBasedChannel;
  channels.polls = client.channels.cache.get(
    channelIds.polls,
  ) as GuildTextBasedChannel;
  channels.oath = client.channels.cache.get(
    channelIds.oath,
  ) as GuildTextBasedChannel;
  channels.activity = client.channels.cache.get(
    channelIds.activity,
  ) as GuildTextBasedChannel;

  logger.info('Channels initialized');
};

export const getChannel = (type: Channels) => channels[type];

const getNextVipCronRun = (locale: string = 'en-GB', offset = 1) => {
  const nextRun = Cron(getFromBotConfig('vipTemporaryChannelCron'), {
    timezone: 'CET',
  })
    .nextRuns(offset)
    .at(-1);
  logger.info(nextRun?.getTimezoneOffset());
  return nextRun === null
    ? '?'
    : new Intl.DateTimeFormat(locale, {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone: 'CET',
      }).format(nextRun);
};

export const scheduleVipTemporaryChannel = async () => {
  Cron(
    getFromBotConfig('vipTemporaryChannelCron'),
    { timezone: 'CET' },
    async () => {
      const existingChannel = client.channels.cache.find(
        (ch) =>
          ch.type !== ChannelType.DM &&
          ch.name === getFromBotConfig('vipTemporaryChannelName'),
      );

      if (existingChannel !== undefined) {
        await existingChannel.delete();
      }

      const guild = client.guilds.cache.get(getFromBotConfig('guild'));

      if (guild === undefined) {
        return;
      }

      const channel = await guild.channels.create({
        name: getFromBotConfig('vipTemporaryChannelName'),
        parent: getFromBotConfig('vipTemporaryChannelParent'),
        topic: `Задните соби на ВИП. Следно бришење е на ${getNextVipCronRun(
          'mk-MK',
          2,
        )}`,
        type: ChannelType.GuildText,
      });
      await channel.setPosition(-3, { relative: true });

      logger.info(
        `Temporary VIP channel recreated. Next recreation is scheduled for ${getNextVipCronRun()}`,
      );
    },
  );

  logger.info(
    `Temporary vip channel recreation is scheduled for ${getNextVipCronRun()}`,
  );
};

export const log = async (
  embed: EmbedBuilder,
  interaction: Interaction,
  type: Channels,
) => {
  const channel = channels[type];

  if (channel === undefined || !channel.isTextBased()) {
    return;
  }

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    logger.error(
      `Failed to send log for interaction ${interaction.id}\n${error}`,
    );
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

export const deleteResponse = (
  message: InteractionResponse | Message,
  interval?: number,
) => {
  setTimeout(
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async () => {
      try {
        await message.delete();
      } catch (error) {
        logger.error(`Failed to delete message ${message.id}\n${error}`);
      }
    },
    interval ?? getFromBotConfig('ephemeralReplyTime'),
  );
};
