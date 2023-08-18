import { createQuestion, getQuestion } from "../data/Question.js";
import { LinksSchema } from "../schemas/LinksSchema.js";
import {
  getQuestionComponents,
  getQuestionEmbed,
} from "../utils/components.js";
import { commandDescriptions } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "question";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Прашање")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("get")
      .setDescription(commandDescriptions["question get"])
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("Прашање")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription(commandDescriptions["question set"])
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("Прашање")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option.setName("answer").setDescription("Одговор").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("links")
          .setDescription("Линкови во JSON формат")
          .setRequired(false)
      )
  );

const handleQuestionGet = async (
  interaction: ChatInputCommandInteraction,
  keyword: string
) => {
  const question = await getQuestion(keyword);

  if (question === null) {
    await interaction.editReply("Не постои такво прашање.");
    return;
  }

  const embed = await getQuestionEmbed(question);
  const components = getQuestionComponents(question);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};

const handleQuestionSet = async (
  interaction: ChatInputCommandInteraction,
  keyword: string
) => {
  const answer = interaction.options.getString("answer", true);
  const links = interaction.options.getString("links");
  const question = await getQuestion(keyword);

  if (question === null) {
    const newQuestion = {
      content: answer,
      links: links === null ? [] : JSON.parse(links),
      name: keyword,
      userId: interaction.user.id,
    };

    const createdQuestion = await createQuestion(newQuestion);
    const questionEmbed = await getQuestionEmbed(createdQuestion);
    const questionComponents = getQuestionComponents(createdQuestion);
    await interaction.editReply({
      components: questionComponents,
      embeds: [questionEmbed],
    });
    return;
  }

  if (links !== null && !LinksSchema.parse(links)) {
    await interaction.editReply("Линковите не се во валиден JSON формат.");
    return;
  }

  question.content = answer;
  question.links = links === null ? [] : JSON.parse(links);

  const embed = await getQuestionEmbed(question);
  const components = getQuestionComponents(question);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};

const questionHandlers = {
  get: handleQuestionGet,
  set: handleQuestionSet,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);
  const keyword = interaction.options.getString("question", true);

  if (Object.keys(questionHandlers).includes(subcommand)) {
    await questionHandlers[subcommand as keyof typeof questionHandlers](
      interaction,
      keyword
    );
  }
};
