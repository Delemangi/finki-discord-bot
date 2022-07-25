import config from '../config/config.json';

export function getFromConfig<T extends keyof Config>(key: T): string {
    return config[key];
}
