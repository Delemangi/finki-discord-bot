import {
  addExperienceByUserId,
  createExperience,
  getExperienceByUserId,
  getExperienceCount,
  getExperienceSorted,
} from "@app/data/Experience.js";
import { deleteResponse } from "@app/utils/channels.js";
import {
  getExperienceEmbed,
  getExperienceLeaderboardFirstPageEmbed,
  getExperienceLeaderboardNextPageEmbed,
  getPaginationComponents,
} from "@app/utils/components.js";
import { getConfigProperty } from "@app/utils/config.js";
import { logger } from "@app/utils/logger.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  logErrorFunctions,
} from "@app/utils/strings.js";
import {
  type ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
} from "discord.js";

const name = "experience";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("experience")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("get")
      .setDescription(commandDescriptions["experience get"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription(commandDescriptions["experience add"])
      .addUserOption((option) =>
        option.setName("user").setDescription("Корисник").setRequired(true),
      )
      .addNumberOption((option) =>
        option.setName("experience").setDescription("Поени").setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("leaderboard")
      .setDescription(commandDescriptions["experience leaderboard"]),
  )
  .setDMPermission(false);

const handleExperienceGet = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser("user") ?? interaction.user;
  const userId = user.id;
  const experience =
    (await getExperienceByUserId(userId)) ??
    (await createExperience({
      experience: 0n,
      lastMessage: new Date(),
      level: 0,
      messages: 0,
      userId,
    }));

  if (experience === null) {
    return;
  }

  const embed = await getExperienceEmbed(experience);
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleExperienceAdd = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser("user", true);
  const experience = interaction.options.getNumber("experience", true);

  await addExperienceByUserId(user.id, experience);

  await interaction.editReply({
    allowedMentions: {
      parse: [],
    },
    content: commandResponseFunctions.experienceAdded(experience, user.id),
  });
};

const handleExperienceLeaderboard = async (
  interaction: ChatInputCommandInteraction,
) => {
  const experience = await getExperienceSorted();

  if (experience === null) {
    await interaction.editReply(commandErrors.dataFetchFailed);

    return;
  }

  const perPage = 8;
  const pages = Math.ceil(experience.length / perPage);
  const total = await getExperienceCount();

  if (total === null) {
    await interaction.editReply(commandErrors.dataFetchFailed);

    return;
  }

  const embed = await getExperienceLeaderboardFirstPageEmbed(experience, total);
  const components = [
    pages === 0 || pages === 1
      ? getPaginationComponents("exp")
      : getPaginationComponents("exp", "start"),
  ];
  const message = await interaction.editReply({
    components,
    embeds: [embed],
  });
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    idle: await getConfigProperty("buttonIdleTime"),
  });

  collector.on("collect", async (buttonInteraction) => {
    if (
      buttonInteraction.user.id !==
      buttonInteraction.message.interaction?.user.id
    ) {
      const mess = await buttonInteraction.reply({
        content: commandErrors.buttonNoPermission,
        ephemeral: true,
      });
      void deleteResponse(mess);

      return;
    }

    const id = buttonInteraction.customId.split(":")[1];

    if (id === undefined) {
      return;
    }

    let buttons;
    let page =
      Number(
        buttonInteraction.message.embeds[0]?.footer?.text?.match(/\d+/gu)?.[0],
      ) - 1;

    if (id === "first") {
      page = 0;
    } else if (id === "last") {
      page = pages - 1;
    } else if (id === "previous") {
      page--;
    } else if (id === "next") {
      page++;
    }

    if (page === 0 && (pages === 0 || pages === 1)) {
      buttons = getPaginationComponents("exp");
    } else if (page === 0) {
      buttons = getPaginationComponents("exp", "start");
    } else if (page === pages - 1) {
      buttons = getPaginationComponents("exp", "end");
    } else {
      buttons = getPaginationComponents("exp", "middle");
    }

    const nextEmbed = await getExperienceLeaderboardNextPageEmbed(
      experience,
      page,
      total,
    );

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(
        logErrorFunctions.interactionUpdateError(
          buttonInteraction.customId,
          error,
        ),
      );
    }
  });

  collector.on("end", async () => {
    try {
      await interaction.editReply({
        components: [getPaginationComponents("exp")],
      });
    } catch (error) {
      logger.error(logErrorFunctions.collectorEndError(name, error));
    }
  });
};

const experienceHandlers = {
  add: handleExperienceAdd,
  get: handleExperienceGet,
  leaderboard: handleExperienceLeaderboard,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(experienceHandlers).includes(subcommand)) {
    await experienceHandlers[subcommand as keyof typeof experienceHandlers](
      interaction,
    );
  }
};
