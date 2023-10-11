import { getNthQuestion, getQuestion } from "../data/Question.js";
import {
  getQuestionComponents,
  getQuestionEmbed,
} from "../utils/components.js";
import { commandDescriptions, commandErrors } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "question";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("Прашање")
      .setRequired(true)
      .setAutocomplete(true),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const keyword = interaction.options.getString("question", true);
  const question = Number.isNaN(Number(keyword))
    ? await getQuestion(keyword)
    : await getNthQuestion(Number(keyword));

  if (question === null) {
    await interaction.editReply(commandErrors.faqNotFound);
    return;
  }

  const embed = await getQuestionEmbed(question);
  const components = getQuestionComponents(question);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};
