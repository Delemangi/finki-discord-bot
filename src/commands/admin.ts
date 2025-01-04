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
import { Channel } from '../lib/schemas/Channel.js';
import { Role } from '../lib/schemas/Role.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import { getMemberFromGuild } from '../utils/guild.js';
import { ADMIN_LEVEL } from '../utils/levels.js';
import {
  isMemberAdmin,
  isMemberBarred,
  isMemberInVip,
  isMemberLevel,
} from '../utils/members.js';
import { startSpecialPoll } from '../utils/polls.js';
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
} from 'discord.js';

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
  const member = await getMemberFromGuild(user.id, interaction);
  const councilChannelId = await getChannelsProperty(Channel.Council);

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

  if (!(await isMemberInVip(member))) {
    await interaction.editReply(commandErrors.userNotVipMember);

    return;
  }

  if (!(await isMemberLevel(member, ADMIN_LEVEL))) {
    await interaction.editReply(commandErrors.userNotLevel);

    return;
  }

  if (await isMemberAdmin(member)) {
    await interaction.editReply(commandErrors.userAdmin);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, 'adminAdd', 0.67);

  if (pollId === null) {
    await interaction.editReply(commandErrors.userSpecialPending);

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

const handleAdminRemove = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.channel?.isSendable()) {
    await interaction.editReply({
      content: commandErrors.unsupportedChannelType,
    });

    return;
  }

  const user = interaction.options.getUser('user', true);
  const notify = interaction.options.getBoolean('notify') ?? true;
  const member = await getMemberFromGuild(user.id, interaction);
  const councilChannelId = await getChannelsProperty(Channel.Council);

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

  if (!(await isMemberAdmin(member))) {
    await interaction.editReply(commandErrors.userNotAdmin);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, 'adminRemove', 0.67);

  if (pollId === null) {
    await interaction.editReply(commandErrors.userSpecialPending);

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
