import { Client, GatewayIntentBits } from 'discord.js';

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
];
const presence = { activities: [{ name: 'World Domination' }] };

export const client = new Client({
  intents,
  presence,
});
