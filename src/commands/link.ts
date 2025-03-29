import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import { getNormalizedLink } from '../utils/links.js';
import { getClosestLink } from '../utils/search.js';

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

  const link = await getClosestLink(keyword);

  if (link === null) {
    await interaction.editReply(commandErrors.linkNotFound);

    return;
  }

  await interaction.editReply({
    content: user
      ? `${commandResponseFunctions.commandFor(user.id)}\n${getNormalizedLink(link.url)}`
      : getNormalizedLink(link.url),
  });
};
