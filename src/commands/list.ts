import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import {
  getListLinksEmbed,
  getListQuestionsEmbed,
} from '../components/commands.js';
import { getLinks } from '../data/api/Link.js';
import { getQuestions } from '../data/api/Question.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';

const name = 'list';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('List')
  .addSubcommand((command) =>
    command
      .setName('questions')
      .setDescription(commandDescriptions['list questions'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('links')
      .setDescription(commandDescriptions['list links'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(false),
      ),
  );

const handleListQuestions = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser('user');

  const questions = await getQuestions();

  if (questions === null) {
    await interaction.editReply({
      content: commandErrors.questionsFetchFailed,
    });

    return;
  }

  const embed = getListQuestionsEmbed(questions);
  await interaction.editReply({
    content: user ? commandResponseFunctions.commandFor(user.id) : null,
    embeds: [embed],
  });
};

const handleListLinks = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user');

  const links = await getLinks();

  if (links === null) {
    await interaction.editReply({
      content: commandErrors.linksFetchFailed,
    });

    return;
  }

  const embed = getListLinksEmbed(links);
  await interaction.editReply({
    content: user ? commandResponseFunctions.commandFor(user.id) : null,
    embeds: [embed],
  });
};

const listHandlers = {
  links: handleListLinks,
  questions: handleListQuestions,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand in listHandlers) {
    await listHandlers[subcommand as keyof typeof listHandlers](interaction);
  }
};
