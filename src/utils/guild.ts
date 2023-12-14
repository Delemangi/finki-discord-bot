import { client } from './client.js';
import { getConfigProperty } from './config.js';
import { type Interaction } from 'discord.js';

export const getGuild = async (interaction?: Interaction) => {
  if (interaction?.guild !== null && interaction?.guild !== undefined) {
    return interaction.guild;
  }

  await client.guilds.fetch();

  const guildId = await getConfigProperty('guild');
  const guild = client.guilds.cache.get(guildId);

  return guild ?? null;
};

export const getMemberFromGuild = async (
  userId: string,
  interaction?: Interaction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    return null;
  }

  return await guild.members.fetch(userId);
};
