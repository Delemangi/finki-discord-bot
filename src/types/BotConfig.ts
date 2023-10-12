import { type ChannelName } from "./ChannelName.js";
import { type Roles } from "./Roles.js";
import { type ColorResolvable } from "discord.js";

export type BotConfig = {
  buttonIdleTime: number;
  channels: {
    [K in ChannelName]: string;
  };
  color: ColorResolvable;
  crosspostChannels: string[];
  crossposting: boolean;
  ephemeralReplyTime: number;
  guild: string;
  leveling: boolean;
  roles: {
    [K in Roles]: string;
  };
  temporaryVIPChannel: {
    cron: string;
    name: string;
    parent: string;
    position: number;
  };
  vipPause: boolean;
};
