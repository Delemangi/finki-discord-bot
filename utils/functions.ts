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

export function generatePollID (len: number, characters = '0123456789abcdef'): string {
  let ID = '';

  for (let i = 0; i < len; i++) {
    ID += characters[Math.floor(Math.random() * characters.length)];
  }

  return ID;
}

export function generatePercentageBar (percentage: number): string {
  if (percentage === 0) {
    return '.'.repeat(20);
  }

  const pb = '█'.repeat(Math.floor(percentage / 5)) + (percentage - Math.floor(percentage) >= 0.5 ? '▌' : '');
  return pb + '.'.repeat(Math.max(0, 20 - pb.length));
}

export function createOptions (options: [string, string][], term: string, capitalizeAll: boolean = false): { name: string; value: string }[] {
  return options
    .filter(([i]) => i.includes(term))
    .map(([, c]) => ({
      name: capitalizeWord(c, capitalizeAll),
      value: capitalizeWord(c, capitalizeAll)
    }))
    .filter((e, i, a) => a.findIndex((t) => t.name === e.name) === i)
    .slice(0, 25);
}

export function capitalizeWord (word: string, capitalizeAll: boolean = false): string {
  return capitalizeAll ? word.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : word.charAt(0).toUpperCase() + word.slice(1);
}
