import { ColorResolvable } from 'discord.js';

declare global {
  type Command = {
    data: {
      name: string;
      toJSON: () => string;
    };
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  };

  type BotConfig = {
    applicationID: string;
    token: string;
    logChannel: string;
    color: ColorResolvable;
  };

  type RoleConfig = {
    color: string[];
    year: string[];
    activity: string[];
  };

  type Option = {
    name: string;
    value: string;
  };

  type Question = {
    question: string;
    answer: string;
    links?: { [index: string]: string; };
  };

  type Link = {
    name: string;
    link: string;
    description?: string;
  };
}

export { };
