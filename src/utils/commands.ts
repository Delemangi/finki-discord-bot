import { type Command } from "../types/Command.js";
import { client } from "./client.js";
import { Collection } from "discord.js";
import { readdirSync } from "node:fs";

const commands = new Collection<string, Command>();

const refreshCommands = async () => {
  commands.clear();

  for (const file of readdirSync("./dist/commands").filter((fi) =>
    fi.endsWith(".js")
  )) {
    const command: Command = await import(`../commands/${file}`);
    commands.set(command.data.name, command);
  }
};

export const getCommand = async (command: string) => {
  if (commands.entries.length === 0) {
    await refreshCommands();
  }

  return commands.get(command);
};

export const getCommands = async () => {
  if (commands.entries.length === 0) {
    await refreshCommands();
  }

  return commands;
};

export const commandMention = (name: string | undefined) => {
  if (name === undefined) {
    return "";
  }

  const command = client.application?.commands.cache.find(
    (cmd) => cmd.name === (name.includes(" ") ? name.split(" ")[0] : name)
  );

  if (command === undefined) {
    return name;
  }

  return `</${name}:${command.id}>`;
};
