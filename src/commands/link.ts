import { getLinks } from '../utils/config.js';
import {
  getLinkComponents,
  getLinkEmbed
} from '../utils/embeds.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

const name = 'link';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .addStringOption((option) => option
    .setName('link')
    .setDescription('Линк')
    .setRequired(true)
    .setAutocomplete(true));

export async function execute (interaction: ChatInputCommandInteraction) {
  const keyword = interaction.options.getString('link', true);
  const link = getLinks().find((l) => l.name === keyword);

  if (link === undefined) {
    await interaction.editReply('Не постои таков линк.');
    return;
  }

  const embed = getLinkEmbed(link);
  const components = getLinkComponents(link);
  await interaction.editReply({
    components,
    embeds: [embed]
  });
}
