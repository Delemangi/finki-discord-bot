declare global {
  type Command = {
    data: {
      name: string;
      toJSON: () => string;
    };
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  };

  type EmbedInfo = {
    name: string;
    value: string;
  };

  type BotConfig = {
    applicationID: string;
    token: string;
    logChannel: string;
  };

  type RoleConfig = {
    color: string[];
    year: string[];
    activity: string[];
  };
}

export { };
