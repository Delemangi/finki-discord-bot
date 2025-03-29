import type { ColorResolvable } from 'discord.js';

import { getConfig, setConfig } from '../data/database/Config.js';
import {
  type BotConfig,
  type BotConfigKeys,
  BotConfigSchema,
  type FullyRequiredBotConfig,
} from '../lib/schemas/BotConfig.js';
import { logger } from '../logger.js';
import { configErrors } from '../translations/errors.js';
import { DEFAULT_CONFIGURATION } from './defaults.js';

let config: BotConfig | undefined;

export const reloadDatabaseConfig = async () => {
  const currentConfig = await getConfig();
  const parsedConfig = BotConfigSchema.safeParse(currentConfig?.value);

  if (parsedConfig.data === undefined) {
    const defaultConfig = await setConfig(DEFAULT_CONFIGURATION);
    config = BotConfigSchema.parse(defaultConfig?.value);

    logger.warn(configErrors.invalidConfiguration);

    return;
  }

  config = parsedConfig.data;
};

export const getConfigProperty = <T extends BotConfigKeys>(key: T) =>
  config?.[key] ?? DEFAULT_CONFIGURATION[key];

export const setConfigProperty = async <T extends BotConfigKeys>(
  key: T,
  value: NonNullable<BotConfig>[T],
) => {
  if (config === undefined) {
    return null;
  }

  config[key] = value;
  const newValue = await setConfig(config);

  return newValue?.value ?? null;
};

export const getConfigKeys = () => Object.keys(DEFAULT_CONFIGURATION);

export const getThemeColor = (): ColorResolvable =>
  (config?.themeColor as ColorResolvable | undefined) ?? 'Random';

export const getChannelsProperty = <
  T extends keyof FullyRequiredBotConfig['channels'],
>(
  key: T,
) => config?.channels?.[key];

export const getCrosspostingProperty = <
  T extends keyof FullyRequiredBotConfig['crossposting'],
>(
  key: T,
) => config?.crossposting?.[key];

export const getExperienceProperty = <
  T extends keyof FullyRequiredBotConfig['experience'],
>(
  key: T,
) => config?.experience?.[key];

export const getIntervalsProperty = <
  T extends keyof FullyRequiredBotConfig['intervals'],
>(
  key: T,
) => config?.intervals?.[key] ?? DEFAULT_CONFIGURATION.intervals[key];

export const getReactionsProperty = <
  T extends keyof FullyRequiredBotConfig['reactions'],
>(
  key: T,
) => config?.reactions?.[key];

export const getRolesProperty = <
  T extends keyof FullyRequiredBotConfig['roles'],
>(
  key: T,
) => config?.roles?.[key];

export const getTemporaryChannelsProperty = <
  T extends keyof FullyRequiredBotConfig['temporaryChannels'],
>(
  key: T,
) => config?.temporaryChannels?.[key];

export const getTicketingProperty = <
  T extends keyof FullyRequiredBotConfig['ticketing'],
>(
  key: T,
) => config?.ticketing?.[key] ?? DEFAULT_CONFIGURATION.ticketing[key];

export const getTicketProperty = (key: string) => {
  const tickets = getTicketingProperty('tickets');

  return tickets?.find((ticket) => ticket.id === key);
};

export const getExperienceMultiplier = (channelId: string) => {
  const multipliers = getExperienceProperty('multipliers');

  return multipliers?.[channelId] ?? 1;
};
