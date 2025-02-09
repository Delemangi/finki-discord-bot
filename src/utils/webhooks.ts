import { type Guild } from 'discord.js';

import { labels } from '../translations/labels.js';
import { getChannelFromGuild } from './guild.js';

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
      name: labels.starboard,
    });
  }

  return firstWebhook;
};
