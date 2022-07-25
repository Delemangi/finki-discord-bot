declare global {
    type Command = {
      data: {
        name: string;
        toJSON: () => string;
      };
      execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    };

    type Config = {
      applicationID: string;
      token: string;
    };
}

export {};
