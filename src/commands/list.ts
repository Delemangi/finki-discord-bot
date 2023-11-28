import {
  getListLinksEmbed,
  getListQuestionsEmbed,
} from "@app/components/commands.js";
import { getLinks } from "@app/data/Link.js";
import { getQuestions } from "@app/data/Question.js";
import {
  commandDescriptions,
  commandErrors,
} from "@app/translations/commands.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "list";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("List")
  .addSubcommand((command) =>
    command
      .setName("questions")
      .setDescription(commandDescriptions["list questions"]),
  )
  .addSubcommand((command) =>
    command.setName("links").setDescription(commandDescriptions["list links"]),
  );

const handleListQuestions = async (
  interaction: ChatInputCommandInteraction,
) => {
  const questions = await getQuestions();

  if (questions === null) {
    await interaction.editReply({
      content: commandErrors.questionsFetchFailed,
    });

    return;
  }

  const embed = await getListQuestionsEmbed(questions);
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleListLinks = async (interaction: ChatInputCommandInteraction) => {
  const links = await getLinks();

  if (links === null) {
    await interaction.editReply({
      content: commandErrors.linksFetchFailed,
    });

    return;
  }

  const embed = await getListLinksEmbed(links);
  await interaction.editReply({
    embeds: [embed],
  });
};

const listHandlers = {
  links: handleListLinks,
  questions: handleListQuestions,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(listHandlers).includes(subcommand)) {
    await listHandlers[subcommand as keyof typeof listHandlers](interaction);
  }
};
