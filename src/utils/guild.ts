import { type Guild, type Interaction } from 'discord.js';

import { client } from '../client.js';
import { getConfigProperty } from '../configuration/main.js';

export const getGuild = async (interaction?: Interaction) => {
  if (interaction?.guild !== null && interaction?.guild !== undefined) {
    return interaction.guild;
  }

  await client.guilds.fetch();

  const guildId = getConfigProperty('guild');

  if (guildId === undefined) {
    return null;
  }

  const guild = client.guilds.cache.get(guildId);

  return guild ?? null;
};

export const getMemberFromGuild = async (
  userId: string,
  guild?: Guild | null,
) => {
  const chosenGuild = guild ?? (await getGuild());

  if (chosenGuild === null) {
    return null;
  }

  try {
    return await chosenGuild.members.fetch(userId);
  } catch {
    return null;
  }
};

export const getChannelFromGuild = async (channelId: string, guild?: Guild) => {
  const guildToUse = guild ?? (await getGuild());

  try {
    return (await guildToUse?.channels.fetch(channelId)) ?? null;
  } catch {
    return null;
  }
};
