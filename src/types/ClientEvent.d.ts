import { type Awaitable, type ClientEvents } from 'discord.js';

type ClientEvent<K extends keyof ClientEvents> = {
  execute: (...args: ClientEvents[K]) => Awaitable<void>;
  name: K;
  once?: boolean;
};
