import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { commandDescriptions } from '../translations/commands.js';

const name = 'home';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.editReply('https://github.com/finki-hub/finki-discord-bot');
};
