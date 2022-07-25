import config from '../config/config.json' assert { type: 'json' };

export function getFromConfig<T extends keyof Config> (key: T): string {
  return config[key];
}
