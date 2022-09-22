import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import {
  getAllOptions,
  getComponentsFromQuestion,
  getEmbedFromQuestion,
  getQuestion
} from '../utils/faq.js';
import { commands } from '../utils/strings.js';

const command = 'faq';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(commands[command])
  .addStringOption((option) => option
    .setName('name')
    .setDescription('Question')
    .setRequired(true)
    .addChoices(...getAllOptions()));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const keyword = interaction.options.getString('name') ?? '';
  const question = getQuestion(keyword);
  const embed = getEmbedFromQuestion(question);
  const components = getComponentsFromQuestion(question);

  await interaction.editReply({
    components,
    embeds: [embed]
  });
}
