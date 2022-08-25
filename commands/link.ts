import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getAllOptions, getEmbedFromLink, getLink } from '../src/links.js';

export const data = new SlashCommandBuilder()
    .setName('link')
    .setDescription('Get a link')
    .addStringOption(option => option
        .setName('keyword')
        .setDescription('Keyword')
        .setRequired(true)
        .addChoices(...getAllOptions()));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
    const keyword = interaction.options.getString('keyword') ?? '';
    const link = getLink(keyword);
    const embed = getEmbedFromLink(link);

    await interaction.editReply({ embeds: [embed] });
}
