import { client } from "./client.js";
import { type ClientEvent } from "@app/types/ClientEvent.js";
import { type ClientEvents } from "discord.js";
import { readdirSync } from "node:fs";

export const attachEventListeners = async () => {
  const eventFiles = readdirSync("./dist/events").filter((file) =>
    file.endsWith(".js"),
  );

  for (const file of eventFiles) {
    const event: ClientEvent<keyof ClientEvents> = await import(
      `@app/events/${file}`
    );

    if (event?.once) {
      client.once(event.name, event.execute);
    } else {
      client.on(event.name, event.execute);
    }
  }
};
