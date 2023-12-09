import { client } from "./client.js";
import { getConfigProperty } from "./config.js";
import { type Interaction } from "discord.js";

export const getGuild = async (interaction?: Interaction) => {
  return (
    interaction?.guild ??
    client.guilds.cache.get(await getConfigProperty("guild")) ??
    null
  );
};
