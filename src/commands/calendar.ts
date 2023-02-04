import { getResponses } from '../utils/config.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

const name = 'calendar';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name]);

export async function execute (interaction: ChatInputCommandInteraction) {
  const response = getResponses().find((r) => r.command === name);

  if (response === undefined) {
    await interaction.reply('Настана грешка при одговарање.');
    return;
  }

  await interaction.editReply(response.response);
}
