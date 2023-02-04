import { getFromBotConfig } from '../utils/config.js';
import { getCrossposting } from '../utils/crossposting.js';
import { logger } from '../utils/logger.js';
import {
  type ClientEvents,
  Events
} from 'discord.js';

export const name = Events.MessageCreate;
const crosspostChannels = getFromBotConfig('crosspostChannels');

export async function execute (...args: ClientEvents[typeof name]) {
  if (crosspostChannels.length === 0 || !crosspostChannels.includes(args[0].channel.id)) {
    return;
  }

  if (!getCrossposting()) {
    logger.warn(`Crossposting is disabled, ignoring message by ${args[0].author.tag}`);
    return;
  }

  try {
    await args[0].crosspost();
  } catch (error) {
    logger.error(`Failed to crosspost message by ${args[0].author.tag}\n${error}`);
  }
}
