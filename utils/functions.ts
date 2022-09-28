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

// Type union for the full 2 billion dolalr mistake in the Javascript Ecosystem
type Nullish = null | undefined;

export function isNullish (value: unknown): value is Nullish {
  return value === undefined || value === null;
}

const channelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildVoice,
  ChannelType.GuildAnnouncement,
  ChannelType.AnnouncementThread,
  ChannelType.PublicThread,
  ChannelType.PrivateThread
];

export function isTextGuildBased (channel: APIInteractionDataResolvedChannel | Channel | null | undefined): channel is NewsChannel | PrivateThreadChannel | PublicThreadChannel | TextChannel | VoiceChannel {
  if (isNullish(channel)) {
    return false;
  }

  return channelTypes.includes(channel.type);
}
