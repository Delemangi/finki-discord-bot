import {
  getPollComponents,
  getPollEmbed,
  getPollStatsComponents,
} from '../components/polls.js';
import { getPollById } from '../data/Poll.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import { getChannelProperty, getRoleProperty } from '../utils/config.js';
import { getMemberFromGuild } from '../utils/guild.js';
import {
  isMemberBarred,
  isMemberInCouncil,
  isMemberInVip,
} from '../utils/members.js';
import { startSpecialPoll } from '../utils/polls.js';
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'council';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Council')
  .addSubcommand((command) =>
    command
      .setName('add')
      .setDescription(commandDescriptions['council add'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Предлог корисник за член на Советот')
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('remove')
      .setDescription(commandDescriptions['council remove'])
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Член на Советот')
          .setRequired(true),
      ),
  );

const handleCouncilAdd = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.channel?.isSendable()) {
    await interaction.editReply({
      content: commandErrors.unsupportedChannelType,
    });

    return;
  }

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

  if (await isMemberBarred(user.id)) {
    await interaction.editReply(commandErrors.userBarred);

    return;
  }

  if (!(await isMemberInVip(member))) {
    await interaction.editReply(commandErrors.userNotVipMember);

    return;
  }

  if (await isMemberInCouncil(member)) {
    await interaction.editReply(commandErrors.userCouncilMember);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, 'councilAdd', 0.67);

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
  await interaction.channel.send(roleMention(await getRoleProperty('council')));
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const handleCouncilRemove = async (
  interaction: ChatInputCommandInteraction,
) => {
  if (!interaction.channel?.isSendable()) {
    await interaction.editReply({
      content: commandErrors.unsupportedChannelType,
    });

    return;
  }

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

  if (!(await isMemberInCouncil(member))) {
    await interaction.editReply(commandErrors.userNotCouncilMember);

    return;
  }

  const pollId = await startSpecialPoll(
    interaction,
    user,
    'councilRemove',
    0.67,
  );

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
  await interaction.channel.send(roleMention(await getRoleProperty('council')));
  await interaction.editReply({
    components,
    embeds: [embed],
  });

  const statsComponents = getPollStatsComponents(poll);
  await interaction.channel.send({
    components: statsComponents,
    content: commandResponseFunctions.pollStats(poll.title),
  });
};

const councilHandlers = {
  add: handleCouncilAdd,
  remove: handleCouncilRemove,
};

export const execute = async (
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand in councilHandlers) {
    await councilHandlers[subcommand as keyof typeof councilHandlers](
      interaction,
    );
  }
};
