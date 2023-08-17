import { type ChannelName } from "./ChannelName.js";
import { type Roles } from "./Roles.js";
import { type ColorResolvable } from "discord.js";

export type BotConfig = {
  channels: { [K in ChannelName]: string };
  color: ColorResolvable;
  crosspost: boolean;
  crosspostChannels: string[];
  ephemeralReplyTime: number;
  guild: string;
  leveling: boolean;
  logo: string;
  roles: { [K in Roles]: string };
  temporaryVIPChannel: {
    cron: string;
    name: string;
    parent: string;
  };
};
