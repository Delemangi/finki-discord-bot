import {
  getQuizComponents,
  getQuizEmbed
} from '../utils/embeds.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

const name = 'quiz';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name]);

export async function execute (interaction: ChatInputCommandInteraction) {
  const embed = getQuizEmbed();
  const components = getQuizComponents(interaction);
  await interaction.editReply({
    components,
    embeds: [embed]
  });
}
