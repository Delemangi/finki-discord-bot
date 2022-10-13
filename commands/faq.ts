import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import {
  getComponentsFromQuestion,
  getEmbedFromQuestion,
  getQuestion
} from '../utils/faq.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'faq';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command])
  .addStringOption((option) => option
    .setName('question')
    .setDescription('Question')
    .setRequired(true)
    .setAutocomplete(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const keyword = interaction.options.getString('question') ?? '';
  const question = getQuestion(keyword);

  if (question === undefined) {
    await interaction.editReply('Не постои такво прашање.');
    return;
  }

  const embed = getEmbedFromQuestion(question);
  const components = getComponentsFromQuestion(question);

  await interaction.editReply({
    components,
    embeds: [embed]
  });
}
