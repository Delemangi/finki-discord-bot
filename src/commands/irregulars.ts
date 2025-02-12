import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
} from 'discord.js';

import {
  getChannelsProperty,
  getRolesProperty,
} from '../configuration/main.js';
import { Channel } from '../lib/schemas/Channel.js';
import { PollType } from '../lib/schemas/PollType.js';
import { Role } from '../lib/schemas/Role.js';
import {
  commandDescriptions,
  commandErrors,
} from '../translations/commands.js';
import { getMemberFromGuild } from '../utils/guild.js';
import {
  isMemberAdmin,
  isMemberBarred,
  isMemberInIrregulars,
  isMemberInRegulars,
  isMemberInVip,
} from '../utils/members.js';
import { createPoll, isPollDuplicate } from '../utils/polls/main.js';

const name = 'irregulars';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Irregulars')
  .addSubcommand((command) =>
    command
      .setName('add')
      .setDescription(commandDescriptions['irregulars add'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Предлог корисник за член на Вонредните')
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName('notify')
          .setDescription('Испрати нотификација')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('remove')
      .setDescription(commandDescriptions['irregulars remove'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Член на Вонредните')
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName('notify')
          .setDescription('Испрати нотификација')
          .setRequired(false),
      ),
  );

const handleIrregularsAdd = async (
  interaction: ChatInputCommandInteraction,
) => {
  if (!interaction.channel?.isSendable()) {
    await interaction.editReply({
      content: commandErrors.unsupportedChannelType,
    });

    return;
  }

  const user = interaction.options.getUser('user', true);
  const notify = interaction.options.getBoolean('notify') ?? true;
  const councilChannelId = getChannelsProperty(Channel.Council);

  if (interaction.channelId !== councilChannelId) {
    await interaction.editReply({
      content: commandErrors.invalidChannel,
    });

    return;
  }

  if (user.bot) {
    await interaction.editReply(commandErrors.userBot);

    return;
  }

  if (await isMemberBarred(user.id)) {
    await interaction.editReply(commandErrors.userBarred);

    return;
  }

  const member = await getMemberFromGuild(user.id, interaction.guild);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (isMemberInIrregulars(member)) {
    await interaction.editReply(commandErrors.userIrregularMember);

    return;
  }

  if (!isMemberInRegulars(member)) {
    await interaction.editReply(commandErrors.userNotRegular);

    return;
  }

  const isDuplicate = await isPollDuplicate(PollType.IRREGULARS_ADD, user.id);

  if (isDuplicate) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const poll = createPoll(PollType.IRREGULARS_ADD, user);
  const councilRoleId = getRolesProperty(Role.Council);

  if (notify && councilRoleId !== undefined) {
    await interaction.channel.send(roleMention(councilRoleId));
  }

  await interaction.editReply(poll);
};

const handleIrregularsRemove = async (
  interaction: ChatInputCommandInteraction,
) => {
  if (!interaction.channel?.isSendable()) {
    await interaction.editReply({
      content: commandErrors.unsupportedChannelType,
    });

    return;
  }

  const user = interaction.options.getUser('user', true);
  const notify = interaction.options.getBoolean('notify') ?? true;
  const councilChannelId = getChannelsProperty(Channel.Council);

  if (interaction.channelId !== councilChannelId) {
    await interaction.editReply({
      content: commandErrors.invalidChannel,
    });

    return;
  }

  if (user.bot) {
    await interaction.editReply(commandErrors.userBot);

    return;
  }

  const member = await getMemberFromGuild(user.id, interaction.guild);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userAdmin);

    return;
  }

  if (isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  if (!isMemberInIrregulars(member)) {
    await interaction.editReply(commandErrors.userNotIrregular);

    return;
  }

  const isDuplicate = await isPollDuplicate(
    PollType.IRREGULARS_REMOVE,
    user.id,
  );

  if (isDuplicate) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const poll = createPoll(PollType.IRREGULARS_REMOVE, user);
  const councilRoleId = getRolesProperty(Role.Council);

  if (notify && councilRoleId !== undefined) {
    await interaction.channel.send(roleMention(councilRoleId));
  }

  await interaction.editReply(poll);
};

const irregularsHandlers = {
  add: handleIrregularsAdd,
  remove: handleIrregularsRemove,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    await interaction.editReply({
      content: commandErrors.serverOnlyCommand,
    });

    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand in irregularsHandlers) {
    await irregularsHandlers[subcommand as keyof typeof irregularsHandlers](
      interaction,
    );
  }
};
