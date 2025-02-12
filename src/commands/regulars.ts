import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { getRolesProperty } from '../configuration/main.js';
import { Role } from '../lib/schemas/Role.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponses,
} from '../translations/commands.js';
import { recreateRegularsTemporaryChannel } from '../utils/channels.js';
import { getMemberFromGuild } from '../utils/guild.js';
import {
  isMemberBarred,
  isMemberInRegulars,
  isMemberInVip,
} from '../utils/members.js';

const name = 'regulars';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Regulars')
  .addSubcommand((command) =>
    command
      .setName('add')
      .setDescription(commandDescriptions['regulars add'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Предлог корисник за член на редовните')
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('remove')
      .setDescription(commandDescriptions['regulars remove'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Предлог корисник за член на редовните')
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('recreate')
      .setDescription(commandDescriptions['regulars recreate']),
  );

const handleRegularsAdd = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user', true);
  const member = await getMemberFromGuild(user.id, interaction.guild);

  const regularRole = getRolesProperty(Role.Regulars);

  if (regularRole === undefined) {
    await interaction.editReply(commandErrors.invalidRole);

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

  if (isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  if (isMemberInRegulars(member)) {
    await interaction.editReply(commandErrors.userRegular);

    return;
  }

  await member.roles.add(regularRole);

  await interaction.editReply(commandResponses.userGivenRegular);
};

const handleRegularsRemove = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser('user', true);
  const member = await getMemberFromGuild(user.id, interaction.guild);

  const regularRole = getRolesProperty(Role.Regulars);

  if (regularRole === undefined) {
    await interaction.editReply(commandErrors.invalidRole);

    return;
  }

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  await member.roles.remove(regularRole);

  await interaction.editReply(commandResponses.userRemovedRegular);
};

const handleRegularsRecreate = async (
  interaction: ChatInputCommandInteraction,
) => {
  await recreateRegularsTemporaryChannel();

  await interaction.editReply(commandResponses.temporaryChannelRecreated);
};

const regularsHandlers = {
  add: handleRegularsAdd,
  recreate: handleRegularsRecreate,
  remove: handleRegularsRemove,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand in regularsHandlers) {
    await regularsHandlers[subcommand as keyof typeof regularsHandlers](
      interaction,
    );
  }
};
