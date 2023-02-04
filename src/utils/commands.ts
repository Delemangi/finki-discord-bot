import { Collection } from 'discord.js';
import { readdirSync } from 'node:fs';

const commands = new Collection<string, Command>();

async function refreshCommands () {
  commands.clear();

  for (const file of readdirSync('./dist/commands').filter((f) => f.endsWith('.js'))) {
    const command: Command = await import(`../commands/${file}`);
    commands.set(command.data.name, command);
  }
}

export async function getCommand (command: string) {
  if (commands.entries.length === 0) {
    await refreshCommands();
  }

  return commands.get(command);
}

export async function getCommands () {
  if (commands.entries.length === 0) {
    await refreshCommands();
  }

  return commands;
}
