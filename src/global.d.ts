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

  type Config = {
    applicationID: string;
    token: string;
    logChannel: string;
    colorRoles: string[];
  };
}

export { };
