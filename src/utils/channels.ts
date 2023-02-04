import { client } from './client.js';
import { getFromBotConfig } from './config.js';
import { logger } from './logger.js';
import {
  type Channel,
  type EmbedBuilder,
  type Interaction
} from 'discord.js';

const channels: { [K in Logs]?: Channel | undefined } = {};

export function initializeChannels () {
  const logChannels = getFromBotConfig('logs');

  if (logChannels === undefined) {
    return;
  }

  channels['actions'] = client.channels.cache.get(logChannels['actions']);
  channels['commands'] = client.channels.cache.get(logChannels['commands']);

  logger.info('Channels initialized');
}

export async function log (embed: EmbedBuilder, interaction: Interaction, type: Logs) {
  const channel = channels[type];

  if (channel === undefined || !channel.isTextBased()) {
    return;
  }

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    logger.error(`Failed to send log for interaction ${interaction.id}\n${error}`);
  }
}
