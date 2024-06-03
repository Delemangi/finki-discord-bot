import {
  getPollComponents,
  getPollEmbed,
  getPollStatsComponents,
} from '../components/polls.js';
import { getPollById } from '../data/Poll.js';
import { getSpecialPollByUserAndType } from '../data/SpecialPoll.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from '../translations/commands.js';
import { recreateVipTemporaryChannel } from '../utils/channels.js';
import { getChannelProperty, getRoleProperty } from '../utils/config.js';
import { getMemberFromGuild } from '../utils/guild.js';
import {
  isMemberAdmin,
  isMemberBarred,
  isMemberInVip,
  isMemberInvitedToVip,
} from '../utils/members.js';
import { startSpecialPoll } from '../utils/polls.js';
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'vip';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('VIP')
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
      .setName('recreate')
      .setDescription(commandDescriptions['vip recreate']),
  );

const handleVipAdd = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user', true);
  const pollsChannel = await getChannelProperty('polls');

  if (interaction.channelId !== pollsChannel) {
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

  const member = await getMemberFromGuild(user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  if (!(await isMemberInvitedToVip(member))) {
    await interaction.editReply(commandErrors.userNotRegular);

    return;
  }

  const existingPoll = await getSpecialPollByUserAndType(user.id, 'vipAdd');

  if (existingPoll !== null) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, 'vipAdd');

  if (pollId === null) {
    await interaction.editReply(commandErrors.pollCreationFailed);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.channel?.send(
    roleMention(await getRoleProperty('council')),
  );
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel?.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const handleVipRemove = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user', true);
  const pollsChannel = await getChannelProperty('polls');

  if (interaction.channelId !== pollsChannel) {
    await interaction.editReply({
      content: commandErrors.invalidChannel,
    });

    return;
  }

  if (user.bot) {
    await interaction.editReply(commandErrors.userBot);

    return;
  }

  const member = await getMemberFromGuild(user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userAdmin);

    return;
  }

  if (!(await isMemberInVip(member))) {
    await interaction.editReply(commandErrors.userNotVipMember);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, 'vipRemove');

  if (pollId === null) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.channel?.send(
    roleMention(await getRoleProperty('council')),
  );
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel?.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const handleVipRecreate = async (interaction: ChatInputCommandInteraction) => {
  await recreateVipTemporaryChannel();

  await interaction.editReply(commandResponses.temporaryChannelRecreated);
};

const vipHandlers = {
  add: handleVipAdd,
  recreate: handleVipRecreate,
  remove: handleVipRemove,
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

  if (subcommand in vipHandlers) {
    await vipHandlers[subcommand as keyof typeof vipHandlers](interaction);
  }
};
