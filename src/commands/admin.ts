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
import { ADMIN_LEVEL } from '../utils/levels.js';
import {
  isMemberAdmin,
  isMemberBarred,
  isMemberInVip,
  isMemberLevel,
} from '../utils/members.js';
import { createPoll, isPollDuplicate } from '../utils/polls/main.js';

const name = 'admin';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Admin')
  .addSubcommand((command) =>
    command
      .setName('add')
      .setDescription(commandDescriptions['admin add'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Предлог корисник за администратор')
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
      .setDescription(commandDescriptions['admin remove'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Администратор')
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName('notify')
          .setDescription('Испрати нотификација')
          .setRequired(false),
      ),
  );

const handleAdminAdd = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.channel?.isSendable()) {
    await interaction.editReply({
      content: commandErrors.unsupportedChannelType,
    });

    return;
  }

  const user = interaction.options.getUser('user', true);
  const notify = interaction.options.getBoolean('notify') ?? true;
  const member = await getMemberFromGuild(user.id, interaction.guild);
  const councilChannelId = getChannelsProperty(Channel.Council);

  if (interaction.channelId !== councilChannelId) {
    await interaction.editReply({
      content: commandErrors.invalidChannel,
    });

    return;
  }

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberBarred(user.id)) {
    await interaction.editReply(commandErrors.userBarred);

    return;
  }

  if (!isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userNotVipMember);

    return;
  }

  if (!(await isMemberLevel(member, ADMIN_LEVEL))) {
    await interaction.editReply(commandErrors.userNotLevel);

    return;
  }

  if (isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userAdmin);

    return;
  }

  const isDuplicate = await isPollDuplicate(PollType.ADMIN_ADD, user.id);

  if (isDuplicate) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const poll = createPoll(PollType.ADMIN_ADD, user);
  const councilRoleId = getRolesProperty(Role.Council);

  if (notify && councilRoleId !== undefined) {
    await interaction.channel.send(roleMention(councilRoleId));
  }

  await interaction.editReply(poll);
};

const handleAdminRemove = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.channel?.isSendable()) {
    await interaction.editReply({
      content: commandErrors.unsupportedChannelType,
    });

    return;
  }

  const user = interaction.options.getUser('user', true);
  const notify = interaction.options.getBoolean('notify') ?? true;
  const member = await getMemberFromGuild(user.id, interaction.guild);
  const councilChannelId = getChannelsProperty(Channel.Council);

  if (interaction.channelId !== councilChannelId) {
    await interaction.editReply({
      content: commandErrors.invalidChannel,
    });

    return;
  }

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (!isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userNotAdmin);

    return;
  }

  const isDuplicate = await isPollDuplicate(PollType.ADMIN_REMOVE, user.id);

  if (isDuplicate) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const poll = createPoll(PollType.ADMIN_REMOVE, user);
  const councilRoleId = getRolesProperty(Role.Council);

  if (notify && councilRoleId !== undefined) {
    await interaction.channel.send(roleMention(councilRoleId));
  }

  await interaction.editReply(poll);
};

const adminHandlers = {
  add: handleAdminAdd,
  remove: handleAdminRemove,
};

export const execute = async (
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand in adminHandlers) {
    await adminHandlers[subcommand as keyof typeof adminHandlers](interaction);
  }
};
