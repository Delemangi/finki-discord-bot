import { PollOption } from '../entities/PollOption.js';
import {
  createPoll,
  deletePoll,
  deletePollOption,
  getPoll,
  savePoll
} from '../utils/database.js';
import {
  getPollComponents,
  getPollEmbed,
  getPollStatsComponents,
  getPollStatsEmbed
} from '../utils/embeds.js';
import { commandMention } from '../utils/functions.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js';

const name = 'poll';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Poll')
  .addSubcommand((command) => command
    .setName('create')
    .setDescription(commands['poll create'])
    .addStringOption((option) => option
      .setName('title')
      .setDescription('Наслов')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Опис')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('options')
      .setDescription('Опции (максимум 25, минимум 1, уникатни, разделени со запирки)')
      .setRequired(true))
    .addBooleanOption((option) => option
      .setName('anonymous')
      .setDescription('Дали е анонимна анкетата?')
      .setRequired(false))
    .addBooleanOption((option) => option
      .setName('multiple')
      .setDescription('Дали е анкетата multiple choice?')
      .setRequired(false))
    .addBooleanOption((option) => option
      .setName('open')
      .setDescription('Дали е анкетата отворена (ажурирање од други корисници)?')
      .setRequired(false)))
  .addSubcommand((command) => command
    .setName('edit')
    .setDescription(commands['poll edit'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('Анкета')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('title')
      .setDescription('Наслов')
      .setRequired(false))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Опис')
      .setRequired(false)))
  .addSubcommand((command) => command
    .setName('stats')
    .setDescription(commands['poll stats'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('Анкета')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('show')
    .setDescription(commands['poll show'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('Анкета')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('add')
    .setDescription(commands['poll add'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('Анкета')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('options')
      .setDescription('Опции (максимум 25, уникатни, разделени со запирки)')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('remove')
    .setDescription(commands['poll remove'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('Анкета')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('options')
      .setDescription('Опции (индекси)')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('delete')
    .setDescription(commands['poll delete'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('Анкета')
      .setRequired(true)));

export async function execute (interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand === 'create') {
    await handlePollCreate(interaction);
  } else if (subcommand === 'edit') {
    await handlePollEdit(interaction);
  } else if (subcommand === 'stats') {
    await handlePollStats(interaction);
  } else if (subcommand === 'show') {
    await handlePollShow(interaction);
  } else if (subcommand === 'add') {
    await handlePollAdd(interaction);
  } else if (subcommand === 'remove') {
    await handlePollRemove(interaction);
  } else if (subcommand === 'delete') {
    await handlePollDelete(interaction);
  }
}

async function handlePollCreate (interaction: ChatInputCommandInteraction) {
  const title = interaction.options.getString('title', true);
  const description = interaction.options.getString('description', true);
  const options = Array.from(new Set(interaction.options.getString('options', true).split(',').filter(Boolean).map((option) => option.trim())));
  const anonymous = interaction.options.getBoolean('anonymous') ?? true;
  const multiple = interaction.options.getBoolean('multiple') ?? false;
  const open = interaction.options.getBoolean('open') ?? false;

  if (options.length === 0) {
    await interaction.editReply('Анкетата мора да има опции.');
    return;
  }

  if (options.length > 25) {
    await interaction.editReply('Анкетата не може да има повеќе од 25 опции.');
    return;
  }

  const poll = await createPoll(interaction, title, description, anonymous, multiple, open, options);

  if (poll === null) {
    await interaction.editReply('Анкетата не беше креирана. Обидете се повторно.');
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.editReply({
    components,
    embeds: [embed]
  });
}

async function handlePollEdit (interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getString('id', true).trim();
  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description');

  const changed = [];

  const poll = await getPoll(id);

  if (poll === null) {
    await interaction.editReply('Анкетата не постои.');
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

  await savePoll(poll);

  await interaction.editReply(`Анкетата е ажурирана (${changed.join(', ')}). Користете ${commandMention('poll show')} за да ги видите промените.`);
}

async function handlePollStats (interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getString('id', true).trim();
  const poll = await getPoll(id);

  if (poll === null) {
    await interaction.editReply('Анкетата не постои.');
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
    embeds: [embed]
  });
}

async function handlePollShow (interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getString('id', true).trim();
  const poll = await getPoll(id);

  if (poll === null) {
    await interaction.editReply('Анкетата не постои.');
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);

  await interaction.editReply({
    components,
    embeds: [embed]
  });
}

async function handlePollAdd (interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getString('id', true).trim();
  const options = interaction.options.getString('options', true).split(',').filter(Boolean).map((option) => option.trim());
  const poll = await getPoll(id);

  if (poll === null) {
    await interaction.editReply('Анкетата не постои.');
    return;
  }

  if (poll.open === false && poll.owner !== interaction.user.id) {
    await interaction.editReply('Ова не е ваша анкета.');
    return;
  }

  if (options.length === 0) {
    await interaction.editReply('Анкетата мора да има опции.');
    return;
  }

  const pollOptions = options
    .filter((option) => !poll.options.some((o) => o.name === option))
    .map((option) => {
      const p = new PollOption();
      p.name = option;
      p.poll = poll;

      return p;
    });

  poll.options = [...poll.options, ...pollOptions];
  await savePoll(poll);

  await interaction.editReply(`Опциите се додадени. Користете ${commandMention('poll show')} за да ги видите промените.`);
}

async function handlePollRemove (interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getString('id', true).trim();
  const options = interaction.options.getString('options', true).split(',').filter(Boolean).map((option) => option.trim());
  const poll = await getPoll(id);

  if (poll === null) {
    await interaction.editReply('Анкетата не постои.');
    return;
  }

  if (poll.owner !== interaction.user.id) {
    await interaction.editReply('Ова не е ваша анкета.');
    return;
  }

  for (const option of options) {
    await deletePollOption(poll, option);
  }

  if (poll.options.length === 0) {
    await deletePoll(id);
    await interaction.editReply('Ги тргнавте сите опции и со тоа ја избришавте анкетата.');
    return;
  }

  await interaction.editReply(`Опциите се избришани. Користете ${commandMention('poll show')} за да ги видите промените.`);
}

async function handlePollDelete (interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getString('id', true).trim();
  const poll = await getPoll(id);

  if (poll === null) {
    await interaction.reply('Анкетата не постои.');
    return;
  }

  const permissions = interaction.member?.permissions as PermissionsBitField | undefined;
  if (permissions === undefined || !permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await interaction.reply('Оваа команда е само за администратори.');
    return;
  }

  await deletePoll(id);

  await interaction.editReply('Анкетата е избришана.');
}
