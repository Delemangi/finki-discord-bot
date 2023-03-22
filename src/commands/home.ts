import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'home';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.editReply('https://github.com/Delemangi/finki-discord-bot');
};
