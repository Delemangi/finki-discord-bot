import {
  ApplicationCommandType,
  type ChatInputCommandInteraction,
  Collection,
  REST,
  Routes,
} from 'discord.js';
import { readdirSync } from 'node:fs';

import { client } from '../client.js';
import { getApplicationId, getToken } from '../configuration/environment.js';
import {
  type Command,
  type ContextMenuCommand,
  type SlashCommand,
} from '../lib/types/Command.js';
import { logger } from '../logger.js';
import { logErrorFunctions, logMessages } from '../translations/logs.js';

const commands = new Collection<string, Command>();

const refreshCommands = async () => {
  const commandFiles = readdirSync('./dist/commands').filter((file) =>
    file.endsWith('.js'),
  );

  commands.clear();

  for (const file of commandFiles) {
    // TODO: Find a way to validate this
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const command: Command = await import(`../commands/${file}`);

    commands.set(command.data.name, command);
  }
};

const isCommandsEmpty = () => commands.entries().next().done;

export const getCommand = async (commandName: string) => {
  if (isCommandsEmpty()) {
    await refreshCommands();
  }

  return commands.get(commandName);
};

export const isSlashCommand = (command: Command): command is SlashCommand => {
  const commandData = command.data.toJSON();

  return (
    commandData.type === undefined ||
    commandData.type === ApplicationCommandType.ChatInput
  );
};

export const isContextMenuCommand = (
  command: Command,
): command is ContextMenuCommand => {
  const commandData = command.data.toJSON();

  return (
    commandData.type === ApplicationCommandType.Message ||
    commandData.type === ApplicationCommandType.User
  );
};

export const getCommands = async () => {
  if (isCommandsEmpty()) {
    await refreshCommands();
  }

  return commands;
};

export const commandMention = (name: string | undefined) => {
  if (name === undefined) {
    return '';
  }

  const command = client.application?.commands.cache.find(
    (cmd) => cmd.name === (name.includes(' ') ? name.split(' ')[0] : name),
  );

  if (command === undefined) {
    return name;
  }

  return `</${name}:${command.id}>`;
};

export const getFullCommandName = (
  interaction: ChatInputCommandInteraction,
) => {
  const subcommand = interaction.options.getSubcommand(false);

  if (subcommand === null) {
    return interaction.commandName;
  }

  return `${interaction.commandName} ${subcommand}`;
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

export const createCommandChoices = (choices: readonly string[]) =>
  choices.map((choice) => ({
    name: choice,
    value: choice,
  }));
