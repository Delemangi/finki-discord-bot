import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { getRandomAnto } from '../data/database/Anto.js';
import {
  commandDescriptions,
  commandErrors,
} from '../translations/commands.js';

const name = 'anto';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const anto = await getRandomAnto();
  await interaction.editReply(anto?.quote ?? commandErrors.noAnto);
};
