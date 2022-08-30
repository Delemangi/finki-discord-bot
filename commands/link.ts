import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getAllOptions, getComponentsFromLink, getEmbedFromLink, getLink } from '../src/links.js';

export const data = new SlashCommandBuilder()
  .setName('link')
  .setDescription('Get a link')
  .addStringOption(option => option
    .setName('name')
    .setDescription('Link name')
    .setRequired(true)
    .addChoices(...getAllOptions()));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const name = interaction.options.getString('name') ?? '';
  const link = getLink(name);
  const embed = getEmbedFromLink(link);
  const components = getComponentsFromLink(link);

  await interaction.editReply({ embeds: [embed], components });
}
