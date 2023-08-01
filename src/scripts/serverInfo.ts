import { client } from "../utils/client.js";
import { getFromBotConfig, getToken } from "../utils/config.js";
import { logger } from "../utils/logger.js";

const server = process.argv[2] ?? getFromBotConfig("guild");

await client.login(getToken());

client.once("ready", async () => {
  logger.info("Bot is ready");

  const guild = client.guilds.cache.get(server);

  if (guild === undefined) {
    throw new Error("The provided server ID must be valid");
  }

  logger.info(`Server name: ${guild.name}`);
  logger.info(`Server owner: ${guild.ownerId}`);
  logger.info(`Server members: ${guild.memberCount}`);
  logger.info(
    `Server channels (with threads): ${
      guild.channels.cache.filter((channel) => !channel.isThread()).size
    }`
  );
  logger.info(`Server channels (all): ${guild.channels.cache.size}`);
  logger.info(`Server roles: ${guild.roles.cache.size}`);
  logger.info(`Server emojis: ${guild.emojis.cache.size}`);
  logger.info(`Server boosts: ${guild.premiumSubscriptionCount}`);
  logger.info(`Server boost level: ${guild.premiumTier}`);

  logger.info("Done");
  client.destroy();
});
