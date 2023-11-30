import {
  getLinkComponents,
  getLinkEmbed,
  getQuestionComponents,
  getQuestionEmbed,
} from "../components/commands.js";
import { createAnto, createAntos, deleteAnto } from "../data/Anto.js";
import {
  createCompanies,
  createCompany,
  deleteCompany,
} from "../data/Company.js";
import { createInfoMessage, getInfoMessage } from "../data/InfoMessage.js";
import { createLink, deleteLink, getLink, updateLink } from "../data/Link.js";
import {
  createQuestion,
  deleteQuestion,
  getQuestion,
  updateQuestion,
} from "../data/Question.js";
import {
  createQuestionLinks,
  deleteQuestionLinksByQuestionId,
} from "../data/QuestionLink.js";
import { createRule, deleteRule } from "../data/Rule.js";
import { AntosSchema } from "../schemas/AntosSchema.js";
import { CompaniesSchema } from "../schemas/CompaniesSchema.js";
import { LinksSchema } from "../schemas/LinksSchema.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponses,
} from "../translations/commands.js";
import { logErrorFunctions } from "../translations/logs.js";
import { logger } from "../utils/logger.js";
import { linkRegex } from "../utils/regex.js";
import { InfoMessageType } from "@prisma/client";
import {
  type ChatInputCommandInteraction,
  codeBlock,
  SlashCommandBuilder,
} from "discord.js";

const name = "manage";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Менаџирај")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("question-set")
      .setDescription(commandDescriptions["manage question-set"])
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("Прашање")
          .setRequired(true)
          .setAutocomplete(true),
      )
      .addStringOption((option) =>
        option.setName("answer").setDescription("Одговор").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("links")
          .setDescription("Линкови во JSON формат")
          .setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("question-delete")
      .setDescription(commandDescriptions["manage question-delete"])
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("Прашање")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("question-content")
      .setDescription(commandDescriptions["manage question-content"])
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("Прашање")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("link-set")
      .setDescription(commandDescriptions["manage link-set"])
      .addStringOption((option) =>
        option
          .setName("link")
          .setDescription("Име на линк")
          .setRequired(true)
          .setAutocomplete(true),
      )
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("Линк до ресурс")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("description").setDescription("Опис").setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("link-delete")
      .setDescription(commandDescriptions["manage link-delete"])
      .addStringOption((option) =>
        option
          .setName("link")
          .setDescription("Линк")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("link-content")
      .setDescription(commandDescriptions["manage link-content"])
      .addStringOption((option) =>
        option
          .setName("link")
          .setDescription("Линк")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("anto-add")
      .setDescription(commandDescriptions["manage anto-add"])
      .addStringOption((option) =>
        option.setName("anto").setDescription("Анто").setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("anto-delete")
      .setDescription(commandDescriptions["manage anto-delete"])
      .addStringOption((option) =>
        option.setName("anto").setDescription("Анто").setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("anto-mass-add")
      .setDescription(commandDescriptions["manage anto-mass-add"])
      .addStringOption((option) =>
        option
          .setName("antos")
          .setDescription("Анто-и во JSON формат")
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rule-set")
      .setDescription(commandDescriptions["manage rule-set"])
      .addStringOption((option) =>
        option.setName("rule").setDescription("Правило").setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rule-delete")
      .setDescription(commandDescriptions["manage rule-delete"])
      .addStringOption((option) =>
        option
          .setName("rule")
          .setDescription("Правило")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("infomessage-set")
      .setDescription(commandDescriptions["manage infomessage-set"])
      .addNumberOption((option) =>
        option
          .setName("index")
          .setDescription("Број на порака")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Тип на порака")
          .setRequired(true)
          .setChoices(
            {
              name: "Текст",
              value: "text",
            },
            {
              name: "Слика",
              value: "image",
            },
          ),
      )
      .addStringOption((option) =>
        option
          .setName("content")
          .setDescription("Содржина (текст или линк до слика)")
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("infomessage-delete")
      .setDescription(commandDescriptions["manage infomessage-delete"])
      .addNumberOption((option) =>
        option
          .setName("index")
          .setDescription("Број на порака")
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("company-set")
      .setDescription(commandDescriptions["manage company-set"])
      .addStringOption((option) =>
        option
          .setName("company")
          .setDescription("Име на компанија")
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("company-delete")
      .setDescription(commandDescriptions["manage company-delete"])
      .addStringOption((option) =>
        option
          .setName("company")
          .setDescription("Име на компанија")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("company-mass-add")
      .setDescription(commandDescriptions["manage company-mass-add"])
      .addStringOption((option) =>
        option
          .setName("companies")
          .setDescription("Компании во JSON формат")
          .setRequired(true),
      ),
  );

const handleManageQuestionSet = async (
  interaction: ChatInputCommandInteraction,
) => {
  const keyword = interaction.options.getString("question", true);
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
      await interaction.editReply(commandErrors.invalidLinks);

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
              }),
            ),
          },
        },
      }),
      name: keyword,
      userId: interaction.user.id,
    };

    const createdQuestion = await createQuestion(newQuestion);

    if (createdQuestion === null) {
      await interaction.editReply(commandErrors.faqCreationFailed);

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
      logger.error(logErrorFunctions.faqSendError(error));
      await interaction.editReply(commandErrors.faqSendFailed);
    }

    return;
  }

  question.content = answer;
  await updateQuestion(question);

  if (links !== null) {
    try {
      LinksSchema.parse(JSON.parse(links));
    } catch (error) {
      logger.error(logErrorFunctions.linksParseError(error));
      await interaction.editReply(commandErrors.invalidLinks);

      return;
    }

    await deleteQuestionLinksByQuestionId(question.id);
    await createQuestionLinks(
      Object.entries(parsedLinks as Record<string, string>).map(
        ([linkName, linkUrl]) => ({
          name: linkName,
          questionId: question.id,
          url: linkUrl,
        }),
      ),
    );
  }

  const updatedQuestion = await getQuestion(keyword);

  if (updatedQuestion === null) {
    await interaction.editReply(commandErrors.faqCreationFailed);

    return;
  }

  try {
    const embed = await getQuestionEmbed(updatedQuestion);
    const components = getQuestionComponents(updatedQuestion);
    await interaction.editReply({
      components,
      embeds: [embed],
    });
  } catch (error) {
    logger.error(logErrorFunctions.faqSendError(error));
    await interaction.editReply(commandErrors.faqSendFailed);
  }
};

const handleManageQuestionDelete = async (
  interaction: ChatInputCommandInteraction,
) => {
  const keyword = interaction.options.getString("question", true);
  const question = await getQuestion(keyword);

  if (question === null) {
    await interaction.editReply(commandErrors.faqNotFound);

    return;
  }

  await deleteQuestion(keyword);
  await interaction.editReply(commandResponses.faqDeleted);
};

const handleManageQuestionContent = async (
  interaction: ChatInputCommandInteraction,
) => {
  const keyword = interaction.options.getString("question", true);
  const question = await getQuestion(keyword);

  if (question === null) {
    await interaction.editReply(commandErrors.faqNotFound);

    return;
  }

  await interaction.editReply(
    "Име:" +
      codeBlock(question.name) +
      "\nОдговор:" +
      codeBlock(question.content.replaceAll("\n", "\\n")) +
      "\nЛинкови:" +
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
              {},
            ),
          null,
          2,
        ),
      ),
  );
};

const handleManageLinkSet = async (
  interaction: ChatInputCommandInteraction,
) => {
  const keyword = interaction.options.getString("link", true);
  const description = interaction.options
    .getString("description")
    ?.replaceAll("\\n", "\n");
  const url = interaction.options.getString("url", true);
  const link = await getLink(keyword);

  if (!linkRegex.test(url)) {
    await interaction.editReply(commandErrors.invalidLink);

    return;
  }

  if (link === null) {
    const newLink = {
      description: description ?? null,
      name: keyword,
      url,
    };

    const createdLink = await createLink(newLink);

    if (createdLink === null) {
      await interaction.editReply(commandErrors.linkCreationFailed);

      return;
    }

    try {
      const linkEmbed = await getLinkEmbed(createdLink);
      const linkComponents = getLinkComponents(createdLink);
      await interaction.editReply({
        components: linkComponents,
        embeds: [linkEmbed],
      });
    } catch (error) {
      logger.error(logErrorFunctions.linkSendError(error));
      await interaction.editReply(commandErrors.linkSendFailed);
    }

    return;
  }

  link.url = url;
  if (description !== undefined) {
    link.description = description;
  }

  await updateLink(link);

  const updatedLink = await getLink(keyword);

  if (updatedLink === null) {
    await interaction.editReply(commandErrors.linkCreationFailed);

    return;
  }

  try {
    const embed = await getLinkEmbed(updatedLink);
    const components = getLinkComponents(updatedLink);
    await interaction.editReply({
      components,
      embeds: [embed],
    });
  } catch (error) {
    logger.error(logErrorFunctions.linkSendError(error));
    await interaction.editReply(commandErrors.linkSendFailed);
  }
};

const handleManageLinkDelete = async (
  interaction: ChatInputCommandInteraction,
) => {
  const keyword = interaction.options.getString("link", true);
  const link = await getLink(keyword);

  if (link === null) {
    await interaction.editReply(commandErrors.linkNotFound);

    return;
  }

  await deleteLink(keyword);
  await interaction.editReply(commandResponses.linkDeleted);
};

const handleManageLinkContent = async (
  interaction: ChatInputCommandInteraction,
) => {
  const keyword = interaction.options.getString("link", true);
  const link = await getLink(keyword);

  if (link === null) {
    await interaction.editReply(commandErrors.linkNotFound);

    return;
  }

  await interaction.editReply(
    "Име:" +
      codeBlock(link.name) +
      "\nОпис:" +
      codeBlock(link.description?.replaceAll("\n", "\\n") ?? "-") +
      "\nЛинк:" +
      codeBlock(link.url),
  );
};

const handleManageAntoAdd = async (
  interaction: ChatInputCommandInteraction,
) => {
  const anto = interaction.options.getString("anto", true);
  const createdAnto = await createAnto({
    quote: anto,
    userId: interaction.user.id,
  });

  if (createdAnto === null) {
    await interaction.editReply(commandErrors.antoCreationFailed);

    return;
  }

  await interaction.editReply(createdAnto.quote);
};

const handleManageAntoDelete = async (
  interaction: ChatInputCommandInteraction,
) => {
  const anto = interaction.options.getString("anto", true);
  const deletedAnto = await deleteAnto(anto);

  if (deletedAnto === null) {
    await interaction.editReply(commandErrors.antoNotFound);

    return;
  }

  await interaction.editReply(commandResponses.antoDeleted);
};

const handleManageAntoMassAdd = async (
  interaction: ChatInputCommandInteraction,
) => {
  const antos = interaction.options.getString("antos", true);
  let parsedAntos;

  try {
    parsedAntos = AntosSchema.parse(JSON.parse(antos));
  } catch (error) {
    logger.error(logErrorFunctions.antosParseError(error));
    await interaction.editReply(commandErrors.invalidAntos);

    return;
  }

  const createdAntos = await createAntos(
    parsedAntos.map((anto) => ({
      quote: anto,
      userId: interaction.user.id,
    })),
  );

  if (createdAntos === null) {
    await interaction.editReply(commandErrors.antosCreationFailed);

    return;
  }

  await interaction.editReply(commandResponses.antosCreated);
};

const handleManageRuleSet = async (
  interaction: ChatInputCommandInteraction,
) => {
  const rule = interaction.options.getString("rule", true);

  await createRule({
    rule,
    userId: interaction.user.id,
  });

  await interaction.editReply(commandResponses.ruleCreated);
};

const handleManageRuleDelete = async (
  interaction: ChatInputCommandInteraction,
) => {
  const rule = interaction.options.getString("rule", true);

  await deleteRule(rule);

  await interaction.editReply(commandResponses.ruleDeleted);
};

const handleMangeInfoMessageSet = async (
  interaction: ChatInputCommandInteraction,
) => {
  const index = interaction.options.getNumber("index", true);
  const type = interaction.options.getString("type", true);
  const content = interaction.options
    .getString("content", true)
    .replaceAll("\\n", "\n");
  const infoMessage = await getInfoMessage(index);

  if (infoMessage === null) {
    await createInfoMessage({
      content,
      index,
      type: type === "text" ? InfoMessageType.TEXT : InfoMessageType.IMAGE,
      userId: interaction.user.id,
    });
  }

  await interaction.editReply(commandResponses.infoCreated);
};

const handleManageInfoMessageDelete = async (
  interaction: ChatInputCommandInteraction,
) => {
  const index = interaction.options.getNumber("index", true);

  const infoMessage = await getInfoMessage(index);

  if (infoMessage === null) {
    await interaction.editReply(commandErrors.infoNotFound);

    return;
  }

  await interaction.editReply(commandResponses.infoDeleted);
};

const handleCompanySet = async (interaction: ChatInputCommandInteraction) => {
  const company = interaction.options.getString("company", true);

  const createdCompany = await createCompany({
    name: company,
    userId: interaction.user.id,
  });

  if (createdCompany === null) {
    await interaction.editReply(commandErrors.companyCreationFailed);

    return;
  }

  await interaction.editReply(commandResponses.companyCreated);
};

const handleCompanyDelete = async (
  interaction: ChatInputCommandInteraction,
) => {
  const company = interaction.options.getString("company", true);

  const deletedCompany = await deleteCompany(company);

  if (deletedCompany === null) {
    await interaction.editReply(commandErrors.companyNotFound);

    return;
  }

  await interaction.editReply(commandResponses.companyDeleted);
};

const handleCompanyMassAdd = async (
  interaction: ChatInputCommandInteraction,
) => {
  const companies = interaction.options.getString("companies", true);
  let parsedCompanies;

  try {
    parsedCompanies = CompaniesSchema.parse(JSON.parse(companies));
  } catch (error) {
    logger.error(logErrorFunctions.companiesParseError(error));
    await interaction.editReply(commandErrors.invalidCompanies);

    return;
  }

  const createdCompanies = await createCompanies(
    parsedCompanies.map((company) => ({
      name: company,
      userId: interaction.user.id,
    })),
  );

  if (createdCompanies === null) {
    await interaction.editReply(commandErrors.companiesCreationFailed);

    return;
  }

  await interaction.editReply(commandResponses.companiesCreated);
};

const manageHandlers = {
  "anto-add": handleManageAntoAdd,
  "anto-delete": handleManageAntoDelete,
  "anto-mass-add": handleManageAntoMassAdd,
  "company-delete": handleCompanyDelete,
  "company-mass-add": handleCompanyMassAdd,
  "company-set": handleCompanySet,
  "infomessage-delete": handleManageInfoMessageDelete,
  "infomessage-set": handleMangeInfoMessageSet,
  "link-content": handleManageLinkContent,
  "link-delete": handleManageLinkDelete,
  "link-set": handleManageLinkSet,
  "question-content": handleManageQuestionContent,
  "question-delete": handleManageQuestionDelete,
  "question-set": handleManageQuestionSet,
  "rule-delete": handleManageRuleDelete,
  "rule-set": handleManageRuleSet,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(manageHandlers).includes(subcommand)) {
    await manageHandlers[subcommand as keyof typeof manageHandlers](
      interaction,
    );
  }
};
