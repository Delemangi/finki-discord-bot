import { REST } from '@discordjs/rest';
import { Client, Collection, Routes } from 'discord.js';
import { getFromConfig } from './src/config.js';
import { readdirSync } from 'fs';
import { logger } from './src/logger.js';

const [applicationID, token] = [getFromConfig('applicationID'), getFromConfig('token')];

if (applicationID === undefined || token === undefined) {
  throw new Error('Missing applicationID or token');
}

const client = new Client({ intents: [], presence: { activities: [{ name: 'World Domination' }] } });
const rest = new REST().setToken(token);

const files = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));
const commands = new Collection<string, Command>();
const commandsJSON: string[] = [];

for (const file of files) {
  const command: Command = await import(`./commands/${file}`);
  commands.set(command.data.name, command);
  commandsJSON.push(command.data.toJSON());
}

try {
  await rest.put(Routes.applicationCommands(applicationID), { body: commandsJSON });
} catch (error) {
  logger.error(`Failed to register application commands: ${error}`);
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  logger.info(`${interaction.user.tag}: ${interaction}`);

  try {
    await interaction.deferReply();
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Failed to handle interaction: ${error}`);
  }
});

client.once('ready', () => {
  logger.info('Bot is ready!');
});

try {
  await client.login(token);
} catch (error) {
  logger.error(`Failed to login to Discord: ${error}`);
}
