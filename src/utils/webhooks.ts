import { getChannelFromGuild } from './guild.js';
import { type Guild } from 'discord.js';

export const getOrCreateWebhookByChannelId = async (
  channelId: string,
  guild?: Guild,
) => {
  const channel = await getChannelFromGuild(channelId, guild);

  if (channel === null || !channel.isTextBased() || channel.isThread()) {
    return null;
  }

  const webhooks = await channel.fetchWebhooks();
  const firstWebhook = webhooks.first();

  if (firstWebhook === undefined) {
    return await channel.createWebhook({
      name: 'Starboard',
    });
  }

  return firstWebhook;
};
