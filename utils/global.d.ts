import { type ColorResolvable } from 'discord.js';

declare global {
  type Command = {
    data: {
      name: string;
      toJSON: () => string;
    };
    execute: (interaction: CommandInteraction) => Promise<void>;
  };

  type BotConfig = {
    applicationID: string;
    color: ColorResolvable;
    crosspostChannels: string[];
    logChannel: string;
    token: string;
  };

  type RoleConfig = {
    activity: string[];
    color: string[];
    notification: string[];
    program: string[];
    subject: { [index: string]: string[] };
    year: string[];
  };

  type Option = {
    name: string;
    value: string;
  };

  type Question = {
    answer: string;
    links?: { [index: string]: string };
    question: string;
  };

  type Link = {
    description?: string;
    link: string;
    name: string;
  };

  type Nullish = null | undefined;
}

export { };
