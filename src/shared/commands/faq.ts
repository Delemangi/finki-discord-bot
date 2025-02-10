import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import {
  getQuestionComponents,
  getQuestionEmbed,
} from '../../components/commands.js';
import { getNthQuestion, getQuestion } from '../../data/Question.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../../translations/commands.js';

export const getCommonCommand = (name: keyof typeof commandDescriptions) => ({
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription(commandDescriptions[name])
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('Прашање')
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addUserOption((option) =>
      option.setName('user').setDescription('Корисник').setRequired(false),
    ),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const keyword = interaction.options.getString('question', true);
    const user = interaction.options.getUser('user');

    const question = Number.isNaN(Number(keyword))
      ? await getQuestion(keyword)
      : await getNthQuestion(Number(keyword));

    if (question === null) {
      await interaction.editReply(commandErrors.faqNotFound);

      return;
    }

    const embed = getQuestionEmbed(question);
    const components = getQuestionComponents(question);
    await interaction.editReply({
      components,
      content: user ? commandResponseFunctions.commandFor(user.id) : null,
      embeds: [embed],
    });
  },
});
