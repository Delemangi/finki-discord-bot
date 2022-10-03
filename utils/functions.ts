import {
  type NewsChannel,
  type PrivateThreadChannel,
  type PublicThreadChannel,
  type TextChannel,
  type VoiceChannel,
  type APIInteractionDataResolvedChannel,
  ChannelType,
  type Channel
} from 'discord.js';
import { getFromBotConfig } from './config.js';

const channelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildVoice,
  ChannelType.GuildAnnouncement,
  ChannelType.AnnouncementThread,
  ChannelType.PublicThread,
  ChannelType.PrivateThread
];

export function checkConfig (): void {
  const applicationID = getFromBotConfig('applicationID');
  const token = getFromBotConfig('token');
  const logChannel = getFromBotConfig('logChannel');
  const color = getFromBotConfig('color');
  const keyvDB = getFromBotConfig('keyvDB');

  if (isEmpty(applicationID)) {
    throw new Error('Missing application ID');
  }

  if (isEmpty(token)) {
    throw new Error('Missing token');
  }

  if (isEmpty(logChannel)) {
    throw new Error('Missing log channel');
  }

  if (isEmpty(color)) {
    throw new Error('Missing color');
  }

  if (isEmpty(keyvDB)) {
    throw new Error('Missing database key');
  }
}

export function isEmpty (value: unknown): value is '' | undefined {
  return value === undefined || value === '';
}

export function isTextGuildBased (channel: APIInteractionDataResolvedChannel | Channel | null | undefined): channel is NewsChannel | PrivateThreadChannel | PublicThreadChannel | TextChannel | VoiceChannel {
  if (channel === null || channel === undefined) {
    return false;
  }

  return channelTypes.includes(channel.type);
}

export function generatePercentageBar (percentage: number) {
  if (percentage === 0) {
    return '.'.repeat(20);
  }

  const pb = '█'.repeat(Math.floor(percentage / 5)) + (percentage - Math.floor(percentage) >= 0.5 ? '▌' : '');
  return pb + '.'.repeat(20 - pb.length);
}
