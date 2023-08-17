import { client } from "../utils/client.js";
import { getApplicationId, getToken } from "../utils/config.js";
import { logger } from "../utils/logger.js";
import { REST, Routes } from "discord.js";

const commands = process.argv.slice(2);

if (commands === undefined || commands.length === 0) {
  client.once("ready", async () => {
    logger.info("Bot is ready");

    const rest = new REST().setToken(getToken());
    await rest.put(Routes.applicationCommands(getApplicationId()), {
      body: [],
    });

    logger.info("Done");
    await client.destroy();
  });
} else {
  client.once("ready", async () => {
    logger.info("Bot is ready");

    const rest = new REST().setToken(getToken());

    for (const command of commands) {
      await rest.delete(Routes.applicationCommand(getApplicationId(), command));
    }

    logger.info("Done");
    await client.destroy();
  });
}

await client.login(getToken());
