import { getConfig, setConfig } from '../data/Config.js';
import {
  type BotConfig,
  type BotConfigKeys,
  BotConfigSchema,
  type FullyRequiredBotConfig,
} from '../lib/schemas/BotConfig.js';
import { logger } from '../logger.js';
import { configErrors } from '../translations/errors.js';
import { DEFAULT_CONFIGURATION } from './defaults.js';
import { type ColorResolvable } from 'discord.js';

export const resetConfiguration = async () => {
  return setConfig(DEFAULT_CONFIGURATION);
};

const databaseConfig = await getConfig();
const { data: config, error } = BotConfigSchema.safeParse(
  databaseConfig?.value,
);

if (error !== undefined) {
  await resetConfiguration();
  logger.warn(configErrors.invalidConfiguration);
}

export const getConfigProperty = async <T extends BotConfigKeys>(key: T) => {
  return config?.[key] ?? DEFAULT_CONFIGURATION[key];
};

export const setConfigProperty = async <T extends BotConfigKeys>(
  key: T,
  value: NonNullable<BotConfig>[T],
) => {
  if (config === null || config === undefined) {
    return null;
  }

  config[key] = value;
  const newValue = await setConfig(config);

  return newValue?.value ?? null;
};

export const getConfigKeys = () => {
  return Object.keys(DEFAULT_CONFIGURATION);
};

export const getThemeColor = (): ColorResolvable => {
  return (config?.themeColor as ColorResolvable) ?? 'Random';
};

export const getChannelsProperty = async <
  T extends keyof FullyRequiredBotConfig['channels'],
>(
  key: T,
) => {
  return config?.channels?.[key];
};

export const getCrosspostingProperty = async <
  T extends keyof FullyRequiredBotConfig['crossposting'],
>(
  key: T,
) => {
  return config?.crossposting?.[key];
};

export const getExperienceProperty = async <
  T extends keyof FullyRequiredBotConfig['experience'],
>(
  key: T,
) => {
  return config?.experience?.[key];
};

export const getIntervalsProperty = async <
  T extends keyof FullyRequiredBotConfig['intervals'],
>(
  key: T,
) => {
  return config?.intervals?.[key] ?? DEFAULT_CONFIGURATION.intervals[key];
};

export const getReactionsProperty = async <
  T extends keyof FullyRequiredBotConfig['reactions'],
>(
  key: T,
) => {
  return config?.reactions?.[key];
};

export const getRolesProperty = async <
  T extends keyof FullyRequiredBotConfig['roles'],
>(
  key: T,
) => {
  return config?.roles?.[key];
};

export const getTemporaryChannelsProperty = async <
  T extends keyof FullyRequiredBotConfig['temporaryChannels'],
>(
  key: T,
) => {
  return config?.temporaryChannels?.[key];
};

export const getTicketingProperty = async <
  T extends keyof FullyRequiredBotConfig['ticketing'],
>(
  key: T,
) => {
  return config?.ticketing?.[key] ?? DEFAULT_CONFIGURATION.ticketing[key];
};

export const getTicketProperty = async (key: string) => {
  const tickets = await getTicketingProperty('tickets');

  return tickets?.find((ticket) => ticket.id === key);
};

export const getExperienceMultiplier = async (channelId: string) => {
  const multipliers = await getExperienceProperty('multipliers');

  return multipliers?.[channelId] ?? 1;
};
