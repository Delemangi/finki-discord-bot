import { type ClientEvent } from "../types/ClientEvent.js";
import { client } from "./client.js";
import { type ClientEvents } from "discord.js";
import { readdirSync } from "node:fs";

export const attachEventListeners = async () => {
  for (const file of readdirSync("./dist/events").filter((fi) =>
    fi.endsWith(".js"),
  )) {
    const event: ClientEvent<keyof ClientEvents> = await import(
      `../events/${file}`
    );

    if (event?.once) {
      client.once(event.name, event.execute);
    } else {
      client.on(event.name, event.execute);
    }
  }
};
