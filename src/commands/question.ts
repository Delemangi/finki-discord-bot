import {
  createQuestion,
  deleteQuestion,
  getQuestion,
} from "../data/Question.js";
import { LinksSchema } from "../schemas/LinksSchema.js";
import {
  getQuestionComponents,
  getQuestionEmbed,
} from "../utils/components.js";
import { logger } from "../utils/logger.js";
import { commandDescriptions } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  codeBlock,
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
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("delete")
      .setDescription(commandDescriptions["question delete"])
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
      .setName("content")
      .setDescription(commandDescriptions["question content"])
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("Прашање")
          .setRequired(true)
          .setAutocomplete(true)
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
  const answer = interaction.options
    .getString("answer", true)
    .replaceAll("\\n", "\n");
  const links = interaction.options.getString("links");
  const question = await getQuestion(keyword);
  let parsedLinks;

  if (links !== null) {
    try {
      parsedLinks = LinksSchema.parse(JSON.parse(links));
    } catch {
      await interaction.editReply("Линковите не се во валиден JSON формат.");
      return;
    }
  }

  if (question === null) {
    const newQuestion = {
      content: answer,
      ...(links !== null && {
        links: {
          createMany: {
            data: Object.entries(parsedLinks as Record<string, string>).map(
              ([linkName, linkUrl]) => ({
                name: linkName,
                url: linkUrl,
              })
            ),
          },
        },
      }),
      name: keyword,
      userId: interaction.user.id,
    };

    const createdQuestion = await createQuestion(newQuestion);

    if (createdQuestion === null) {
      await interaction.editReply(
        "Креирањето на прашањето беше неуспешно. Проверете дали е креирано."
      );
      return;
    }

    try {
      const questionEmbed = await getQuestionEmbed(createdQuestion);
      const questionComponents = getQuestionComponents(createdQuestion);
      await interaction.editReply({
        components: questionComponents,
        embeds: [questionEmbed],
      });
    } catch (error) {
      logger.error(`Failed sending a question\n${error}`);
      await interaction.editReply(
        "Креирањето на прашањето беше неуспешно. Проверете дали е креирано."
      );
    }

    return;
  }

  if (links !== null && !LinksSchema.parse(links)) {
    await interaction.editReply("Линковите не се во валиден JSON формат.");
    return;
  }

  question.content = answer;
  question.links = links === null ? [] : JSON.parse(links);

  try {
    const embed = await getQuestionEmbed(question);
    const components = getQuestionComponents(question);
    await interaction.editReply({
      components,
      embeds: [embed],
    });
  } catch (error) {
    logger.error(`Failed sending a question\n${error}`);
    await interaction.editReply(
      "Креирањето на прашањето беше неуспешно. Проверете дали е креирано."
    );
  }
};

const handleQuestionDelete = async (
  interaction: ChatInputCommandInteraction,
  keyword: string
) => {
  const question = await getQuestion(keyword);

  if (question === null) {
    await interaction.editReply("Не постои такво прашање.");
    return;
  }

  await deleteQuestion(keyword);
  await interaction.editReply("Прашањето е избришано.");
};

const handleQuestionContent = async (
  interaction: ChatInputCommandInteraction,
  keyword: string
) => {
  const question = await getQuestion(keyword);

  if (question === null) {
    await interaction.editReply("Не постои такво прашање.");
    return;
  }

  await interaction.editReply(
    "Content:" +
      codeBlock(question.content.replaceAll("\n", "\\n")) +
      "\nLinks:" +
      codeBlock(
        JSON.stringify(
          question.links
            .map(({ name: linkName, url }) => ({
              [linkName]: url,
            }))
            // eslint-disable-next-line unicorn/no-array-reduce
            .reduce<Record<string, string>>(
              (accumulator, currentValue) => ({
                ...accumulator,
                ...currentValue,
              }),
              {}
            ),
          null,
          2
        )
      )
  );
};

const questionHandlers = {
  content: handleQuestionContent,
  delete: handleQuestionDelete,
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
