import {
  getPollComponents,
  getPollEmbed,
  getPollStatsComponents,
} from '../components/polls.js';
import {
  getChannelsProperty,
  getRolesProperty,
} from '../configuration/main.js';
import { getPollById } from '../data/Poll.js';
import { getSpecialPollByUserAndType } from '../data/SpecialPoll.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import { Channel } from '../types/schemas/Channel.js';
import { Role } from '../types/schemas/Role.js';
import { getMemberFromGuild } from '../utils/guild.js';
import {
  isMemberAdmin,
  isMemberBarred,
  isMemberInIrregulars,
  isMemberInRegulars,
  isMemberInVip,
} from '../utils/members.js';
import { startSpecialPoll } from '../utils/polls.js';
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
} from 'discord.js';

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
  const councilChannelId = await getChannelsProperty(Channel.Council);

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

  const member = await getMemberFromGuild(user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberInIrregulars(member)) {
    await interaction.editReply(commandErrors.userIrregularMember);

    return;
  }

  if (!(await isMemberInRegulars(member))) {
    await interaction.editReply(commandErrors.userNotRegular);

    return;
  }

  const existingPoll = await getSpecialPollByUserAndType(
    user.id,
    'irregularsAdd',
  );

  if (existingPoll !== null) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, 'irregularsAdd');

  if (pollId === null) {
    await interaction.editReply(commandErrors.pollCreationFailed);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const councilRoleId = await getRolesProperty(Role.Council);

  if (notify && councilRoleId !== undefined) {
    await interaction.channel.send(roleMention(councilRoleId));
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
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
  const councilChannelId = await getChannelsProperty(Channel.Council);

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

  const member = await getMemberFromGuild(user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userAdmin);

    return;
  }

  if (await isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  if (!(await isMemberInIrregulars(member))) {
    await interaction.editReply(commandErrors.userNotIrregular);

    return;
  }

  const existingPoll = await getSpecialPollByUserAndType(
    user.id,
    'irregularsRemove',
  );

  if (existingPoll !== null) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, 'irregularsRemove');

  if (pollId === null) {
    await interaction.editReply(commandErrors.pollCreationFailed);

    return;
  }

  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const councilRoleId = await getRolesProperty(Role.Council);

  if (notify && councilRoleId !== undefined) {
    await interaction.channel.send(roleMention(councilRoleId));
  }

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
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
