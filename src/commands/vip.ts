import {
  createVipPoll,
  getPollById,
  getVipPollByUserAndType,
  savePoll,
} from '../utils/database.js';
import {
  getPollComponents,
  getPollEmbed,
  getVipEmbed,
} from '../utils/embeds.js';
import { handlePollButtonForVipVote } from '../utils/interactions.js';
import { getRole } from '../utils/roles.js';
import { commandDescriptions, errors } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'vip';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('VIP')
  .addSubcommand((command) =>
    command
      .setName('members')
      .setDescription(commandDescriptions['vip members']),
  )
  .addSubcommand((command) =>
    command
      .setName('add')
      .setDescription(commandDescriptions['vip add'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Предлог корисник за член на ВИП')
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('remove')
      .setDescription(commandDescriptions['vip remove'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Член на ВИП').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('override')
      .setDescription(commandDescriptions['vip override'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('type')
          .setDescription('Тип на анкета')
          .setRequired(true)
          .addChoices(
            ...['add', 'remove'].map((choice) => ({
              name: choice,
              value: choice,
            })),
          ),
      )
      .addStringOption((option) =>
        option
          .setName('decision')
          .setDescription('Одлука')
          .setRequired(true)
          .addChoices(
            ...['Да', 'Не'].map((choice) => ({ name: choice, value: choice })),
          ),
      ),
  )
  .setDMPermission(false);

const handleVipMembers = async (interaction: ChatInputCommandInteraction) => {
  const embeds = await getVipEmbed(interaction);
  await interaction.editReply({ embeds });
};

const handleVipAdd = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user', true);

  if (user.bot) {
    await interaction.editReply('Корисникот не смее да биде бот.');
    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id,
  );

  if (member === undefined) {
    await interaction.editReply('Корисникот не е член на овој сервер.');
    return;
  }

  const vipRole = getRole('vip');
  const adminRole = getRole('admin');

  if (vipRole === undefined || adminRole === undefined) {
    await interaction.editReply(
      'Улогите за пристап до ВИП или не се конфигурирани или не постојат.',
    );
    return;
  }

  if (
    member.roles.cache.has(vipRole.id) ||
    member.roles.cache.has(adminRole.id)
  ) {
    await interaction.editReply('Корисникот е веќе член на ВИП.');
    return;
  }

  const poll = await createVipPoll(user, 'add', 0.67);

  if (poll === null) {
    await interaction.editReply('Веќе постои предлог за овој корисник.');
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.editReply({ components, embeds: [embed] });
};

const handleVipRemove = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user', true);

  if (user.bot) {
    await interaction.editReply('Корисникот не смее да биде бот.');
    return;
  }

  const member = interaction.guild?.members.cache.find(
    (mem) => mem.id === user.id,
  );

  if (member === undefined) {
    await interaction.editReply('Корисникот не е член на овој сервер.');
  }

  const vipRole = getRole('vip');
  const adminRole = getRole('admin');

  if (vipRole === undefined || adminRole === undefined) {
    await interaction.editReply(
      'Улогите за пристап до ВИП или не се конфигурирани или не постојат.',
    );
    return;
  }

  if (member?.roles.cache.has(adminRole.id)) {
    await interaction.editReply('Корисникот е администратор.');
    return;
  }

  if (!member?.roles.cache.has(vipRole.id)) {
    await interaction.editReply('Корисникот не е член на ВИП.');
    return;
  }

  const poll = await createVipPoll(user, 'remove', 0.67);

  if (poll === null) {
    await interaction.editReply('Веќе постои предлог за овој корисник.');
    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.editReply({ components, embeds: [embed] });
};

const handleVipOverride = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user', true);
  const type = interaction.options.getString('type', true);
  const decision = interaction.options.getString('decision', true);

  const vipPoll = await getVipPollByUserAndType(user.id, type);
  const poll = await getPollById(vipPoll?.id);

  if (vipPoll === null || poll === null) {
    await interaction.editReply('Не постои анкета за овој корисник.');
    return;
  }

  poll.done = true;
  poll.decision = decision;

  await savePoll(poll);

  const member = interaction.guild?.members.cache.get(vipPoll.user);

  if (member === undefined) {
    await interaction.editReply('Корисникот не е член на овој сервер.');
    return;
  }

  await handlePollButtonForVipVote(poll, member);

  await interaction.editReply('Успешно е затворена и спроведена анкетата.');
};

const vipHandlers = {
  add: handleVipAdd,
  members: handleVipMembers,
  override: handleVipOverride,
  remove: handleVipRemove,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    await interaction.editReply({ content: errors.serverOnlyCommand });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand in vipHandlers) {
    await vipHandlers[subcommand as keyof typeof vipHandlers](interaction);
  }
};
