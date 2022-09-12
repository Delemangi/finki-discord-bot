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

const channelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildVoice,
  ChannelType.GuildAnnouncement,
  ChannelType.AnnouncementThread,
  ChannelType.PublicThread,
  ChannelType.PrivateThread
];

export function isTextGuildBased (channel: APIInteractionDataResolvedChannel | Channel | null | undefined): channel is NewsChannel | PrivateThreadChannel | PublicThreadChannel | TextChannel | VoiceChannel {
  if (channel === null || channel === undefined) {
    return false;
  }

  return channelTypes.includes(channel.type);
}
