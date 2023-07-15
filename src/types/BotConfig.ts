import { type ChannelName } from './ChannelName.js';
import { type Mode } from './Mode.js';
import { type Roles } from './Roles.js';
import { type ColorResolvable } from 'discord.js';

export type BotConfig = {
  channels?: { [K in ChannelName]: string };
  color?: ColorResolvable;
  crosspostChannels?: string[];
  ephemeralReplyTime: number;
  guild: string;
  leveling: boolean;
  logo: string;
  mode: Mode;
  profiles: { [K in Mode]: { applicationId: string; token: string } };
  roles?: { [K in Roles]: string };
  vipTemporaryChannelCron: string;
  vipTemporaryChannelName: string;
  vipTemporaryChannelParent: string;
};
