import { type ChannelName } from "./ChannelName.js";
import { type Roles } from "./Roles.js";
import { type ColorResolvable } from "discord.js";

export type BotConfig = {
  buttonIdleTime: number;
  channels: Record<ChannelName, string>;
  color: ColorResolvable;
  crosspostChannels: string[];
  crossposting: boolean;
  ephemeralReplyTime: number;
  guild: string;
  leveling: boolean;
  roles: Record<Roles, string>;
  temporaryVIPChannel: {
    cron: string;
    name: string;
    parent: string;
    position: number;
  };
  vipPause: boolean;
};
