import { sendEmbed } from "../utils/channels.js";
import { client } from "../utils/client.js";
import { getColorsComponents, getColorsEmbed } from "../utils/components.js";
import { getFromRoleConfig, getToken } from "../utils/config.js";
import { logger } from "../utils/logger.js";

const [channelId, image, newlines] = process.argv.slice(2);

if (channelId === undefined || image === undefined) {
  throw new Error("Missing channel ID or image argument");
}

await client.login(getToken());

client.once("ready", async () => {
  logger.info("Bot is ready");

  const channel = client.channels.cache.get(channelId);
  const roles = getFromRoleConfig("color");

  if (channel === undefined || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error("The provided channel must be a guild text channel");
  }

  if (roles.length === 0) {
    throw new Error("No color roles have been provided");
  }

  const embed = await getColorsEmbed(image);
  const components = getColorsComponents();
  try {
    await sendEmbed(channel, embed, components, Number(newlines));
  } catch (error) {
    throw new Error(`Failed to send embed\n${error}`);
  }

  logger.info("Done");
  await client.destroy();
});
