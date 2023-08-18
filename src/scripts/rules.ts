import { client } from "../utils/client.js";
import { getRulesEmbed } from "../utils/components.js";
import { getToken } from "../utils/config.js";
import { logger } from "../utils/logger.js";

const channelId = process.argv[2];

if (channelId === undefined) {
  throw new Error("Missing channel ID argument");
}

await client.login(getToken());

client.once("ready", async () => {
  logger.info("Bot is ready");

  const channel = client.channels.cache.get(channelId);

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error("The provided channel must be a guild text channel");
  }

  const embed = await getRulesEmbed();
  try {
    await channel.send({
      embeds: [embed],
    });
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info("Done");
  await client.destroy();
});
