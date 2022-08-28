import { readFileSync } from 'fs';

const config: Config = JSON.parse(readFileSync('./config/config.json', 'utf8'));

export function getFromConfig<T extends keyof Config> (key: T): Config[T] {
  return config[key];
}
