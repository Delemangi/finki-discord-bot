import { createLink, deleteLink, getLink, updateLink } from "../data/Link.js";
import { getLinkComponents, getLinkEmbed } from "../utils/components.js";
import { logger } from "../utils/logger.js";
import { commandDescriptions } from "../utils/strings.js";
import { type Prisma } from "@prisma/client";
import {
  type ChatInputCommandInteraction,
  codeBlock,
  SlashCommandBuilder,
} from "discord.js";

const name = "url";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Линк")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("get")
      .setDescription(commandDescriptions["url get"])
      .addStringOption((option) =>
        option
          .setName("link")
          .setDescription("Линк")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription(commandDescriptions["url set"])
      .addStringOption((option) =>
        option
          .setName("link")
          .setDescription("Име на линк")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option.setName("url").setDescription("Линк до ресурс").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("description").setDescription("Опис").setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("delete")
      .setDescription(commandDescriptions["url delete"])
      .addStringOption((option) =>
        option
          .setName("link")
          .setDescription("Линк")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("content")
      .setDescription(commandDescriptions["url content"])
      .addStringOption((option) =>
        option
          .setName("link")
          .setDescription("Линк")
          .setRequired(true)
          .setAutocomplete(true)
      )
  );

const handleUrlGet = async (
  interaction: ChatInputCommandInteraction,
  keyword: string
) => {
  const link = await getLink(keyword);

  if (link === null) {
    await interaction.editReply("Не постои таков линк.");
    return;
  }

  const embed = await getLinkEmbed(link);
  const components = getLinkComponents(link);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};

const handleLinkSet = async (
  interaction: ChatInputCommandInteraction,
  keyword: string
) => {
  const description = interaction.options
    .getString("description")
    ?.replaceAll("\\n", "\n");
  const url = interaction.options.getString("url", true);
  const link = await getLink(keyword);

  if (!/https?:\/\/\S+\.\S+/u.test(url)) {
    await interaction.editReply("Линкот не е валиден.");
    return;
  }

  if (link === null) {
    const newLink: Prisma.LinkCreateInput = {
      description: description ?? null,
      name: keyword,
      url,
    };

    const createdLink = await createLink(newLink);

    if (createdLink === null) {
      await interaction.editReply(
        "Креирањето на линкот беше неуспешно. Проверете дали е креиран."
      );
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
      logger.error(`Failed sending a link\n${error}`);
      await interaction.editReply(
        "Креирањето на линкот беше неуспешно. Проверете дали е креиран."
      );
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
    await interaction.editReply(
      "Креирањето на линкот беше неуспешно. Проверете дали е креиран."
    );
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
    logger.error(`Failed sending a link\n${error}`);
    await interaction.editReply(
      "Креирањето на линкот беше неуспешно. Проверете дали е креиран."
    );
  }
};

const handleLinkDelete = async (
  interaction: ChatInputCommandInteraction,
  keyword: string
) => {
  const link = await getLink(keyword);

  if (link === null) {
    await interaction.editReply("Не постои таков линк.");
    return;
  }

  await deleteLink(keyword);
  await interaction.editReply("Линкот е избришан.");
};

const handleLinkContent = async (
  interaction: ChatInputCommandInteraction,
  keyword: string
) => {
  const link = await getLink(keyword);

  if (link === null) {
    await interaction.editReply("Не постои такво прашање.");
    return;
  }

  await interaction.editReply(
    "Име:" +
      codeBlock(link.name) +
      "\nОпис:" +
      codeBlock(link.description?.replaceAll("\n", "\\n") ?? "-") +
      "\nЛинк:" +
      codeBlock(link.url)
  );
};

const linkHandlers = {
  content: handleLinkContent,
  delete: handleLinkDelete,
  get: handleUrlGet,
  set: handleLinkSet,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);
  const keyword = interaction.options.getString("link", true);

  if (Object.keys(linkHandlers).includes(subcommand)) {
    await linkHandlers[subcommand as keyof typeof linkHandlers](
      interaction,
      keyword
    );
  }
};
