import { ColorResolvable } from 'discord.js';

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
    token: string;
    logChannel: string;
    color: ColorResolvable;
  };

  type RoleConfig = {
    color: string[];
    year: string[];
    activity: string[];
    subject: { [index: string]: string[]; };
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
