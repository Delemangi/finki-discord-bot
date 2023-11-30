import { Client } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
];
const presence = {
  activities: [
    {
      name: "World Domination",
    },
  ],
};

export const client = new Client({
  intents,
  presence,
});
