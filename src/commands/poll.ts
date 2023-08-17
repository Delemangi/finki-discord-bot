import { deletePoll, getPollById, getPolls, updatePoll } from "../data/Poll.js";
import {
  createPollOption,
  deletePollOptionsByPollIdAndName,
  getMostPopularOptionByPollId,
} from "../data/PollOption.js";
import { deleteResponse } from "../utils/channels.js";
import { commandMention } from "../utils/commands.js";
import {
  getPaginationComponents,
  getPollComponents,
  getPollEmbed,
  getPollInfoEmbed,
  getPollListFirstPageEmbed,
  getPollListNextPageEmbed,
  getPollStatsComponents,
  getPollStatsEmbed,
} from "../utils/embeds.js";
import { logger } from "../utils/logger.js";
import { startPoll } from "../utils/polls.js";
import { commandDescriptions, errors } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
} from "discord.js";

const name = "poll";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Poll")
  .addSubcommand((command) =>
    command
      .setName("create")
      .setDescription(commandDescriptions["poll create"])
      .addStringOption((option) =>
        option.setName("title").setDescription("Наслов").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("description").setDescription("Опис").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("options")
          .setDescription(
            "Опции (максимум 24, минимум 1, уникатни, разделени со запирки)"
          )
          .setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName("anonymous")
          .setDescription("Дали е анонимна анкетата?")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("multiple")
          .setDescription("Дали е анкетата multiple choice?")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("open")
          .setDescription(
            "Дали е анкетата отворена (ажурирање од други корисници)?"
          )
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("roles")
          .setDescription("Улоги за кои е анкетата (IDs, разделени со запирки)")
          .setRequired(false)
      )
      .addNumberOption((option) =>
        option
          .setName("threshold")
          .setDescription("Праг за завршување на анкетата")
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("edit")
      .setDescription(commandDescriptions["poll edit"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("title").setDescription("Наслов").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("description").setDescription("Опис").setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("roles")
          .setDescription("Улоги за кои е анкетата (IDs, разделени со запирки)")
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("stats")
      .setDescription(commandDescriptions["poll stats"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("show")
      .setDescription(commandDescriptions["poll show"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("add")
      .setDescription(commandDescriptions["poll add"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("options")
          .setDescription("Опции (максимум 24, уникатни, разделени со запирки)")
          .setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("remove")
      .setDescription(commandDescriptions["poll remove"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("options")
          .setDescription("Опции (индекси)")
          .setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("delete")
      .setDescription(commandDescriptions["poll delete"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("open")
      .setDescription(commandDescriptions["poll open"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("close")
      .setDescription(commandDescriptions["poll close"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("list")
      .setDescription(commandDescriptions["poll list"])
      .addBooleanOption((option) =>
        option
          .setName("all")
          .setDescription("Дали да се листаат сите анкети?")
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command
      .setName("info")
      .setDescription(commandDescriptions["poll info"])
      .addStringOption((option) =>
        option.setName("id").setDescription("Анкета").setRequired(true)
      )
  )
  .setDMPermission(false);

const handlePollCreate = async (interaction: ChatInputCommandInteraction) => {
  const title = interaction.options.getString("title", true);
  const description = interaction.options.getString("description", true);
  const options = Array.from(
    new Set(
      interaction.options
        .getString("options", true)
        .split(",")
        .filter(Boolean)
        .map((option) => option.trim())
    )
  );
  const anonymous = interaction.options.getBoolean("anonymous") ?? true;
  const multiple = interaction.options.getBoolean("multiple") ?? false;
  const open = interaction.options.getBoolean("open") ?? false;
  const roles = (interaction.options.getString("roles")?.trim() ?? "")
    .split(",")
    .filter(Boolean);
  const threshold = interaction.options.getNumber("threshold") ?? 0.5;

  if (options.length === 0) {
    await interaction.editReply("Анкетата мора да има опции.");
    return;
  }

  if (options.length > 24) {
    await interaction.editReply("Анкетата не може да има повеќе од 24 опции.");
    return;
  }

  const pollId = await startPoll(
    interaction,
    title,
    description,
    anonymous,
    multiple,
    open,
    options,
    roles,
    threshold
  );

  if (pollId === null) {
    await interaction.editReply(
      "Анкетата не беше креирана. Обидете се повторно."
    );
    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(
      "Анкетата не беше креирана. Обидете се повторно."
    );
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};

const handlePollEdit = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();
  const title = interaction.options.getString("title");
  const description = interaction.options.getString("description");
  const roles = interaction.options
    .getString("roles")
    ?.trim()
    .split(",")
    .filter(Boolean);

  const changed = [];

  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (title !== null) {
    poll.title = title;
    changed.push("наслов");
  }

  if (description !== null) {
    poll.description = description;
    changed.push("опис");
  }

  if (roles !== undefined) {
    poll.roles = roles;
    changed.push("улоги");
  }

  await updatePoll(poll);

  await interaction.editReply(
    `Анкетата е ажурирана (${changed.join(", ")}). Користете ${commandMention(
      "poll show"
    )} за да ги видите промените.`
  );
};

const handlePollStats = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (poll.anonymous) {
    await interaction.editReply("Анкетата е анонимна.");
    return;
  }

  const embed = await getPollStatsEmbed(poll);
  const components = getPollStatsComponents(poll);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};

const handlePollShow = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);

  await interaction.editReply({
    components,
    embeds: [embed],
  });
};

const handlePollAdd = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();
  const options = interaction.options
    .getString("options", true)
    .split(",")
    .filter(Boolean)
    .map((option) => option.trim());
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (!poll.open && poll.userId !== interaction.user.id) {
    await interaction.editReply(errors.pollNoPermission);
    return;
  }

  if (options.length === 0) {
    await interaction.editReply("Анкетата мора да има опции.");
    return;
  }

  if (poll.options.length + options.length > 24) {
    await interaction.editReply("Анкетата не може да има повеќе од 24 опции.");
    return;
  }

  await Promise.all(
    options
      .filter((option) => !poll.options.some((opt) => opt.name === option))
      .map(
        async (option) =>
          await createPollOption({
            name: option,
            poll: { connect: { id: poll.id } },
          })
      )
  );

  await interaction.editReply(
    `Опциите се додадени. Користете ${commandMention(
      "poll show"
    )} за да ги видите промените.`
  );
};

const handlePollRemove = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();
  const options = interaction.options
    .getString("options", true)
    .split(",")
    .filter(Boolean)
    .map((option) => option.trim());
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (poll.userId !== interaction.user.id) {
    await interaction.editReply(errors.pollNoPermission);
    return;
  }

  for (const option of options) {
    await deletePollOptionsByPollIdAndName(poll.id, option);
    poll.options = poll.options.filter((opt) => opt.name !== option);
  }

  if (poll.options.length === 0) {
    await deletePoll(id);
    await interaction.editReply(
      "Ги тргнавте сите опции и со тоа ја избришавте анкетата."
    );
    return;
  }

  await interaction.editReply(
    `Опциите се избришани. Користете ${commandMention(
      "poll show"
    )} за да ги видите промените.`
  );
};

const handlePollDelete = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.reply(errors.pollNotFound);
    return;
  }

  await deletePoll(id);

  await interaction.editReply("Анкетата е избришана.");
};

const handlePollOpen = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (poll.userId !== interaction.user.id) {
    await interaction.editReply(errors.pollNoPermission);
    return;
  }

  if (!poll.done) {
    await interaction.editReply("Анкетата е веќе отворена.");
    return;
  }

  poll.done = false;
  await updatePoll(poll);

  await interaction.editReply("Анкетата е сега отворена. Може да се гласа.");
};

const handlePollClose = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (poll.userId !== interaction.user.id) {
    await interaction.editReply(errors.pollNoPermission);
    return;
  }

  if (poll.done) {
    await interaction.editReply("Анкетата е веќе затворена.");
    return;
  }

  poll.done = true;

  const decision = await getMostPopularOptionByPollId(poll.id);
  if (decision !== null) {
    poll.decision = decision.name;
  }

  await updatePoll(poll);

  await interaction.editReply(
    "Анкетата е сега затворена. Не може повеќе да се гласа."
  );
};

const handlePollList = async (interaction: ChatInputCommandInteraction) => {
  const all = interaction.options.getBoolean("all") ?? false;

  const polls = all
    ? await getPolls()
    : (await getPolls()).filter((poll) => !poll.done);
  const pollsPerPage = 8;
  const pages = Math.ceil(polls.length / pollsPerPage);
  const embed = await getPollListFirstPageEmbed(polls, all);
  const components = [
    pages === 0 || pages === 1
      ? getPaginationComponents("polls")
      : getPaginationComponents("polls", "start"),
  ];
  const message = await interaction.editReply({
    components,
    embeds: [embed],
  });
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30_000,
  });

  collector.on("collect", async (buttonInteraction) => {
    if (
      buttonInteraction.user.id !==
      buttonInteraction.message.interaction?.user.id
    ) {
      const mess = await buttonInteraction.reply({
        content: "Ова не е ваша команда.",
        ephemeral: true,
      });
      void deleteResponse(mess);
      return;
    }

    const id = buttonInteraction.customId.split(":")[1];

    if (id === "undefined") {
      return;
    }

    let buttons;
    let page =
      Number(
        buttonInteraction.message.embeds[0]?.footer?.text?.match(/\d+/gu)?.[0]
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
      buttons = getPaginationComponents("polls");
    } else if (page === 0) {
      buttons = getPaginationComponents("polls", "start");
    } else if (page === pages - 1) {
      buttons = getPaginationComponents("polls", "end");
    } else {
      buttons = getPaginationComponents("polls", "middle");
    }

    const nextEmbed = await getPollListNextPageEmbed(polls, page, all);

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(`Failed to update poll list command\n${error}`);
    }
  });

  collector.on("end", async () => {
    try {
      await message.edit({
        components: [getPaginationComponents("polls")],
      });
    } catch (error) {
      logger.error(`Failed to update poll list command\n${error}`);
    }
  });
};

const handlePollInfo = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString("id", true).trim();

  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (interaction.guild === null) {
    await interaction.editReply(errors.serverOnlyCommand);
    return;
  }

  const embed = await getPollInfoEmbed(interaction.guild, poll);
  await interaction.editReply({ embeds: [embed] });
};

const pollHandlers = {
  add: handlePollAdd,
  close: handlePollClose,
  create: handlePollCreate,
  delete: handlePollDelete,
  edit: handlePollEdit,
  info: handlePollInfo,
  list: handlePollList,
  open: handlePollOpen,
  remove: handlePollRemove,
  show: handlePollShow,
  stats: handlePollStats,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(pollHandlers).includes(subcommand)) {
    await pollHandlers[subcommand as keyof typeof pollHandlers](interaction);
  }
};
