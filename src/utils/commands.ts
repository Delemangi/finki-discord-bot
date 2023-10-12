import { type Command } from "../types/Command.js";
import { client } from "./client.js";
import { getApplicationId, getToken } from "./config.js";
import { logger } from "./logger.js";
import { logErrorFunctions, logMessages } from "./strings.js";
import { Collection, REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";

const commands = new Collection<string, Command>();

const refreshCommands = async () => {
  const commandFiles = readdirSync("./dist/commands").filter((file) =>
    file.endsWith(".js"),
  );

  commands.clear();

  for (const file of commandFiles) {
    const command: Command = await import(`../commands/${file}`);
    commands.set(command.data.name, command);
  }
};

export const getCommand = async (command: string) => {
  if (commands.entries().next().done) {
    await refreshCommands();
  }

  return commands.get(command);
};

export const getCommands = async () => {
  if (commands.entries().next().done) {
    await refreshCommands();
  }

  return commands;
};

export const commandMention = (name: string | undefined) => {
  if (name === undefined) {
    return "";
  }

  const command = client.application?.commands.cache.find(
    (cmd) => cmd.name === (name.includes(" ") ? name.split(" ")[0] : name),
  );

  if (command === undefined) {
    return name;
  }

  return `</${name}:${command.id}>`;
};

export const registerCommands = async () => {
  const rest = new REST().setToken(getToken());
  const cmds = [];

  for (const [, command] of await getCommands()) {
    cmds.push(command.data.toJSON());
  }

  try {
    await rest.put(Routes.applicationCommands(getApplicationId()), {
      body: cmds,
    });
    logger.info(logMessages.commandsRegistered);
  } catch (error) {
    logger.error(logErrorFunctions.commandsRegistrationError(error));
  }
};
