import { type ChannelName } from './ChannelName.js';
import { type Roles } from './Roles.js';
import { type TicketType } from './TicketType.js';
import { type ColorResolvable } from 'discord.js';

export type BotConfig = {
  buttonIdleTime: number;
  channels: Record<ChannelName, string>;
  color: ColorResolvable;
  crosspostChannels: string[];
  crossposting: boolean;
  ephemeralReplyTime: number;
  experienceMultipliers: Record<string, number>;
  guild: string;
  leveling: boolean;
  maxTicketInactivityDays: number;
  reactions: {
    add: Record<string, string>;
    remove: Record<string, string>;
  };
  roles: Record<Roles, string>;
  starboard: string;
  temporaryRegularsChannel: {
    cron: string;
    name: string;
    parent: string;
    position: number;
  };
  temporaryVIPChannel: {
    cron: string;
    name: string;
    parent: string;
    position: number;
  };
  tickets: TicketType[];
  vipPause: boolean;
};
