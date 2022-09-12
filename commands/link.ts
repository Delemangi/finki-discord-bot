import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import {
  getAllOptions,
  getComponentsFromLink,
  getEmbedFromLink,
  getLink
} from '../utils/links.js';

export const data = new SlashCommandBuilder()
  .setName('link')
  .setDescription('Get a link')
  .addStringOption((option) => option
    .setName('name')
    .setDescription('Link')
    .setRequired(true)
    .addChoices(...getAllOptions()));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const name = interaction.options.getString('name') ?? '';
  const link = getLink(name);
  const embed = getEmbedFromLink(link);
  const components = getComponentsFromLink(link);

  await interaction.editReply({
    components,
    embeds: [embed]
  });
}
