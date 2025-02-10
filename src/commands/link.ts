import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { getLinkComponents, getLinkEmbed } from '../components/commands.js';
import { getLink, getNthLink } from '../data/Link.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';

const name = 'link';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addStringOption((option) =>
    option
      .setName('link')
      .setDescription('Линк')
      .setRequired(true)
      .setAutocomplete(true),
  )
  .addUserOption((option) =>
    option.setName('user').setDescription('Корисник').setRequired(false),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const keyword = interaction.options.getString('link', true);
  const user = interaction.options.getUser('user');

  const link = Number.isNaN(Number(keyword))
    ? await getLink(keyword)
    : await getNthLink(Number(keyword));

  if (link === null) {
    await interaction.editReply(commandErrors.linkNotFound);

    return;
  }

  const embed = getLinkEmbed(link);
  const components = getLinkComponents(link);
  await interaction.editReply({
    components,
    content: user ? commandResponseFunctions.commandFor(user.id) : null,
    embeds: [embed],
  });
};
