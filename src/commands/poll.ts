import { PollOption } from '../entities/PollOption.js';
import { deleteResponse } from '../utils/channels.js';
import {
  createPoll,
  deletePoll,
  deletePollOption,
  getAllPolls,
  getMostPopularPollOption,
  getPollById,
  savePoll,
} from '../utils/database.js';
import {
  getPaginationComponents,
  getPollComponents,
  getPollEmbed,
  getPollListFirstPageEmbed,
  getPollListNextPageEmbed,
  getPollStatsComponents,
  getPollStatsEmbed,
} from '../utils/embeds.js';
import { commandMention } from '../utils/functions.js';
import { logger } from '../utils/logger.js';
import { commands, errors } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  ComponentType,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'poll';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Poll')
  .addSubcommand((command) =>
    command
      .setName('create')
      .setDescription(commands['poll create'])
      .addStringOption((option) =>
        option.setName('title').setDescription('Наслов').setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('description').setDescription('Опис').setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('options')
          .setDescription(
            'Опции (максимум 25, минимум 1, уникатни, разделени со запирки)',
          )
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName('anonymous')
          .setDescription('Дали е анонимна анкетата?')
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        option
          .setName('multiple')
          .setDescription('Дали е анкетата multiple choice?')
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        option
          .setName('open')
          .setDescription(
            'Дали е анкетата отворена (ажурирање од други корисници)?',
          )
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName('roles')
          .setDescription('Улоги за кои е анкетата (IDs, разделени со запирки)')
          .setRequired(false),
      )
      .addNumberOption((option) =>
        option
          .setName('threshold')
          .setDescription('Праг за завршување на анкетата')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('edit')
      .setDescription(commands['poll edit'])
      .addStringOption((option) =>
        option.setName('id').setDescription('Анкета').setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('title').setDescription('Наслов').setRequired(false),
      )
      .addStringOption((option) =>
        option.setName('description').setDescription('Опис').setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName('roles')
          .setDescription('Улоги за кои е анкетата (IDs, разделени со запирки)')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('stats')
      .setDescription(commands['poll stats'])
      .addStringOption((option) =>
        option.setName('id').setDescription('Анкета').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('show')
      .setDescription(commands['poll show'])
      .addStringOption((option) =>
        option.setName('id').setDescription('Анкета').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('add')
      .setDescription(commands['poll add'])
      .addStringOption((option) =>
        option.setName('id').setDescription('Анкета').setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('options')
          .setDescription('Опции (максимум 25, уникатни, разделени со запирки)')
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('remove')
      .setDescription(commands['poll remove'])
      .addStringOption((option) =>
        option.setName('id').setDescription('Анкета').setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('options')
          .setDescription('Опции (индекси)')
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('delete')
      .setDescription(commands['poll delete'])
      .addStringOption((option) =>
        option.setName('id').setDescription('Анкета').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('open')
      .setDescription(commands['poll open'])
      .addStringOption((option) =>
        option.setName('id').setDescription('Анкета').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('close')
      .setDescription(commands['poll close'])
      .addStringOption((option) =>
        option.setName('id').setDescription('Анкета').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('list')
      .setDescription(commands['poll list'])
      .addBooleanOption((option) =>
        option
          .setName('all')
          .setDescription('Дали да се листаат сите анкети?')
          .setRequired(false),
      ),
  );

const handlePollCreate = async (interaction: ChatInputCommandInteraction) => {
  const title = interaction.options.getString('title', true);
  const description = interaction.options.getString('description', true);
  const options = Array.from(
    new Set(
      interaction.options
        .getString('options', true)
        .split(',')
        .filter(Boolean)
        .map((option) => option.trim()),
    ),
  );
  const anonymous = interaction.options.getBoolean('anonymous') ?? true;
  const multiple = interaction.options.getBoolean('multiple') ?? false;
  const open = interaction.options.getBoolean('open') ?? false;
  const roles = (interaction.options.getString('roles')?.trim() ?? '')
    .split(',')
    .filter(Boolean);
  const threshold = interaction.options.getNumber('threshold') ?? 0.5;

  if (options.length === 0) {
    await interaction.editReply('Анкетата мора да има опции.');
    return;
  }

  if (options.length > 25) {
    await interaction.editReply('Анкетата не може да има повеќе од 25 опции.');
    return;
  }

  const poll = await createPoll(
    interaction,
    title,
    description,
    anonymous,
    multiple,
    open,
    options,
    roles,
    threshold,
  );

  if (poll === null) {
    await interaction.editReply(
      'Анкетата не беше креирана. Обидете се повторно.',
    );
    return;
  }

  const embed = await getPollEmbed(interaction, poll);
  const components = getPollComponents(poll);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};

const handlePollEdit = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString('id', true).trim();
  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description');
  const roles = interaction.options
    .getString('roles')
    ?.trim()
    .split(',')
    .filter(Boolean);

  const changed = [];

  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (title !== null) {
    poll.title = title;
    changed.push('наслов');
  }

  if (description !== null) {
    poll.description = description;
    changed.push('опис');
  }

  if (roles !== undefined) {
    poll.roles = roles;
    changed.push('улоги');
  }

  await savePoll(poll);

  await interaction.editReply(
    `Анкетата е ажурирана (${changed.join(', ')}). Користете ${commandMention(
      'poll show',
    )} за да ги видите промените.`,
  );
};

const handlePollStats = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString('id', true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (poll.anonymous) {
    await interaction.editReply('Анкетата е анонимна.');
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
  const id = interaction.options.getString('id', true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  const embed = await getPollEmbed(interaction, poll);
  const components = getPollComponents(poll);

  await interaction.editReply({
    components,
    embeds: [embed],
  });
};

const handlePollAdd = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString('id', true).trim();
  const options = interaction.options
    .getString('options', true)
    .split(',')
    .filter(Boolean)
    .map((option) => option.trim());
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (!poll.open && poll.owner !== interaction.user.id) {
    await interaction.editReply(errors.pollNoPermission);
    return;
  }

  if (options.length === 0) {
    await interaction.editReply('Анкетата мора да има опции.');
    return;
  }

  const pollOptions = options
    .filter((option) => !poll.options.some((opt) => opt.name === option))
    .map((option) => {
      const pollOption = new PollOption();
      pollOption.name = option;
      pollOption.poll = poll;

      return pollOption;
    });

  poll.options = [...poll.options, ...pollOptions];
  await savePoll(poll);

  await interaction.editReply(
    `Опциите се додадени. Користете ${commandMention(
      'poll show',
    )} за да ги видите промените.`,
  );
};

const handlePollRemove = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString('id', true).trim();
  const options = interaction.options
    .getString('options', true)
    .split(',')
    .filter(Boolean)
    .map((option) => option.trim());
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (poll.owner !== interaction.user.id) {
    await interaction.editReply(errors.pollNoPermission);
    return;
  }

  for (const option of options) {
    await deletePollOption(poll.id, option);
    poll.options = poll.options.filter((opt) => opt.name !== option);
  }

  if (poll.options.length === 0) {
    await deletePoll(id);
    await interaction.editReply(
      'Ги тргнавте сите опции и со тоа ја избришавте анкетата.',
    );
    return;
  }

  await interaction.editReply(
    `Опциите се избришани. Користете ${commandMention(
      'poll show',
    )} за да ги видите промените.`,
  );
};

const handlePollDelete = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString('id', true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.reply(errors.pollNotFound);
    return;
  }

  const permissions = interaction.member?.permissions as
    | PermissionsBitField
    | undefined;
  if (
    permissions === undefined ||
    !permissions.has(PermissionsBitField.Flags.ManageMessages)
  ) {
    await interaction.reply(errors.adminOnlyCommand);
    return;
  }

  await deletePoll(id);

  await interaction.editReply('Анкетата е избришана.');
};

const handlePollOpen = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString('id', true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (poll.owner !== interaction.user.id) {
    await interaction.editReply(errors.pollNoPermission);
    return;
  }

  if (!poll.done) {
    await interaction.editReply('Анкетата е веќе отворена.');
    return;
  }

  poll.done = false;
  await savePoll(poll);

  await interaction.editReply('Анкетата е сега отворена. Може да се гласа.');
};

const handlePollClose = async (interaction: ChatInputCommandInteraction) => {
  const id = interaction.options.getString('id', true).trim();
  const poll = await getPollById(id);

  if (poll === null) {
    await interaction.editReply(errors.pollNotFound);
    return;
  }

  if (poll.owner !== interaction.user.id) {
    await interaction.editReply(errors.pollNoPermission);
    return;
  }

  if (poll.done) {
    await interaction.editReply('Анкетата е веќе затворена.');
    return;
  }

  poll.done = true;

  const decision = await getMostPopularPollOption(poll);
  if (decision !== null) {
    poll.decision = decision;
  }

  await savePoll(poll);

  await interaction.editReply(
    'Анкетата е сега затворена. Не може повеќе да се гласа.',
  );
};

const handlePollList = async (interaction: ChatInputCommandInteraction) => {
  const all = interaction.options.getBoolean('all') ?? false;

  const polls = all
    ? await getAllPolls()
    : (await getAllPolls()).filter((poll) => !poll.done);

  const embed = await getPollListFirstPageEmbed(polls, all);
  const components = [getPaginationComponents('polls', 'start')];
  const message = await interaction.editReply({
    components,
    embeds: [embed],
  });
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30_000,
  });
  const pollsPerPage = 8;
  const pages = Math.ceil(polls.length / pollsPerPage);

  collector.on('collect', async (buttonInteraction) => {
    if (
      buttonInteraction.user.id !==
      buttonInteraction.message.interaction?.user.id
    ) {
      const mess = await buttonInteraction.reply({
        content: 'Ова не е ваша команда.',
        ephemeral: true,
      });
      deleteResponse(mess);
      return;
    }

    const id = buttonInteraction.customId.split('-')[1];

    if (id === 'undefined') {
      return;
    }

    let buttons;
    let page =
      Number(
        buttonInteraction.message.embeds[0]?.footer?.text?.match(/\d+/gu)?.[0],
      ) - 1;

    if (id === 'first') {
      page = 0;
    } else if (id === 'last') {
      page = pages - 1;
    } else if (id === 'previous') {
      page--;
    } else if (id === 'next') {
      page++;
    }

    if (page === 0) {
      buttons = getPaginationComponents('polls', 'start');
    } else if (page === pages - 1) {
      buttons = getPaginationComponents('polls', 'end');
    } else {
      buttons = getPaginationComponents('polls', 'middle');
    }

    const nextEmbed = getPollListNextPageEmbed(polls, page, all);

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(`Failed to update poll list command\n${error}`);
    }
  });

  collector.on('end', async () => {
    try {
      await message.edit({
        components: [getPaginationComponents('polls')],
      });
    } catch (error) {
      logger.error(`Failed to update poll list command\n${error}`);
    }
  });
};

const pollHandlers = {
  add: handlePollAdd,
  close: handlePollClose,
  create: handlePollCreate,
  delete: handlePollDelete,
  edit: handlePollEdit,
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
