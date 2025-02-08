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
  commandResponses,
} from '../translations/commands.js';
import { labels } from '../translations/labels.js';
import { POLL_TYPE_LABELS } from '../translations/polls.js';
import { formatUsers } from '../translations/users.js';
import { getChannel } from '../utils/channels.js';
import { createCommandChoices } from '../utils/commands.js';
import { getGuild, getMemberFromGuild } from '../utils/guild.js';
import { isMemberAdmin, isMemberBarred } from '../utils/members.js';
import { safeReplyToInteraction } from '../utils/messages.js';
import { POLL_TYPES } from '../utils/polls/constants.js';
import {
  createPoll,
  getActivePolls,
  getMissingVoters,
  getPollInformation,
  isPollDuplicate,
} from '../utils/polls/main.js';
import { getMembersByRoleIds } from '../utils/roles.js';
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
  userMention,
} from 'discord.js';

const name = 'special';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Special')
  .addSubcommand((command) =>
    command.setName('list').setDescription(commandDescriptions['special list']),
  )
  .addSubcommand((command) =>
    command
      .setName('delete')
      .setDescription(commandDescriptions['special delete'])
      .addStringOption((option) =>
        option.setName('poll').setDescription('Анкета').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('override')
      .setDescription(commandDescriptions['special override'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('type')
          .setDescription('Тип на анкета')
          .setRequired(true)
          .addChoices(...createCommandChoices(POLL_TYPES)),
      )
      .addStringOption((option) =>
        option
          .setName('decision')
          .setDescription('Одлука')
          .setRequired(false)
          .addChoices(...createCommandChoices(POLL_TYPES)),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('remaining')
      .setDescription(commandDescriptions['special remaining'])
      .addStringOption((option) =>
        option.setName('poll').setDescription('Анкета').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('bar')
      .setDescription(commandDescriptions['special bar'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(true),
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
      .setName('unbar')
      .setDescription(commandDescriptions['special unbar'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName('notify')
          .setDescription('Испрати нотификација')
          .setRequired(false),
      ),
  );

const handleSpecialList = async (interaction: ChatInputCommandInteraction) => {
  const polls = await getActivePolls();
  const pollsInfo = polls.map((poll) =>
    getPollInformation(poll.message.content),
  );

  const output = pollsInfo.map(({ pollType, userId }, index) => {
    if (pollType === null || userId === null) {
      return '';
    }

    return `${index + 1}. ${POLL_TYPE_LABELS[pollType]} ${userMention(userId)}`;
  });

  await safeReplyToInteraction(interaction, output.join('\n'));
};

const handleSpecialDelete = async (
  interaction: ChatInputCommandInteraction,
) => {
  const pollId = interaction.options.getString('poll', true);
  const channel = getChannel(Channel.Council);

  if (channel === null) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const message = await channel?.messages.fetch(pollId);
  await message?.poll?.end();

  await interaction.editReply(commandResponses.pollDeleted);
};

const handleSpecialOverride = async (
  interaction: ChatInputCommandInteraction,
) => {
  // const user = interaction.options.getUser('user', true);
  // const type = interaction.options.getString('type', true);
  // const decision = interaction.options.getString('decision');

  // const specialPoll = await getSpecialPollByUserAndType(user.id, type);
  // const poll = await getPollById(specialPoll?.pollId);

  // if (specialPoll === null || poll === null) {
  //   await interaction.editReply(commandErrors.pollNotFound);

  //   return;
  // }

  // if (decision === null) {
  //   await abstainAllMissingVotes(poll.id);
  //   await decidePoll(poll.id);
  // } else {
  //   poll.decision = decision;
  //   poll.done = true;

  //   await updatePoll(poll);
  // }

  // const member = await getMemberFromGuild(specialPoll.userId, interaction);

  // if (member === null) {
  //   await interaction.editReply(commandErrors.userNotMember);

  //   return;
  // }

  // const newPoll = await getPollById(poll.id);

  // if (newPoll === null) {
  //   await interaction.editReply(commandErrors.pollNotFound);

  //   return;
  // }

  // await handlePollButtonForSpecialVote(newPoll, member);

  // await interaction.editReply(
  //   commandResponseFunctions.pollOverriden(newPoll.decision ?? labels.unknown),
  // );

  await interaction.editReply(commandErrors.notImplemented);
};

const handleSpecialRemaining = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const pollId = interaction.options.getString('poll', true);
  const councilChannel = getChannel(Channel.Council);

  if (councilChannel === null) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const message = await councilChannel?.messages.fetch(pollId);
  const poll = message?.poll;

  if (poll === undefined || poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const councilRole = await getRolesProperty(Role.Council);

  if (councilRole === undefined) {
    await interaction.editReply(commandErrors.invalidRole);

    return;
  }

  const voters = await getMissingVoters(poll);
  const allVoters = await getMembersByRoleIds(guild, [councilRole]);
  const missingVoters = allVoters.filter((voter) => !voters.includes(voter));
  const missingVotersMembers = missingVoters
    .map((id) => guild.members.cache.get(id))
    .filter((member) => member !== undefined);
  const missingVotersFormatted = formatUsers(
    labels.remaining,
    missingVotersMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, missingVotersFormatted);
};

const handleSpecialBar = async (interaction: ChatInputCommandInteraction) => {
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

  const isDuplicate = await isPollDuplicate(PollType.BAR, user.id);

  if (isDuplicate) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const poll = createPoll(PollType.BAR, user);
  const councilRoleId = await getRolesProperty(Role.Council);

  if (notify && councilRoleId !== undefined) {
    await interaction.channel.send(roleMention(councilRoleId));
  }

  await interaction.editReply(poll);
};

const handleSpecialUnbar = async (interaction: ChatInputCommandInteraction) => {
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

  if (!(await isMemberBarred(user.id))) {
    await interaction.editReply(commandErrors.userNotBarred);

    return;
  }

  const isDuplicate = await isPollDuplicate(PollType.UNBAR, user.id);

  if (isDuplicate) {
    await interaction.editReply(commandErrors.userSpecialPending);

    return;
  }

  const poll = createPoll(PollType.UNBAR, user);
  const councilRoleId = await getRolesProperty(Role.Council);

  if (notify && councilRoleId !== undefined) {
    await interaction.channel.send(roleMention(councilRoleId));
  }

  await interaction.editReply(poll);
};

const specialHandlers = {
  bar: handleSpecialBar,
  delete: handleSpecialDelete,
  list: handleSpecialList,
  override: handleSpecialOverride,
  remaining: handleSpecialRemaining,
  unbar: handleSpecialUnbar,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand in specialHandlers) {
    await specialHandlers[subcommand as keyof typeof specialHandlers](
      interaction,
    );
  }
};
