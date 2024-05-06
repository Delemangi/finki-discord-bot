import { getPaginationComponents } from '../components/pagination.js';
import {
  getPollComponents,
  getPollEmbed,
  getPollStatsComponents,
  getSpecialPollListEmbed,
} from '../components/polls.js';
import { deletePoll, getPollById, updatePoll } from '../data/Poll.js';
import { getPollVotesByPollId } from '../data/PollVote.js';
import {
  deleteSpecialPoll,
  getSpecialPollById,
  getSpecialPollByPollId,
  getSpecialPollByUserAndType,
  getSpecialPolls,
} from '../data/SpecialPoll.js';
import { handlePollButtonForSpecialVote } from '../interactions/button.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
  commandResponses,
} from '../translations/commands.js';
import { labels } from '../translations/labels.js';
import { logErrorFunctions } from '../translations/logs.js';
import { formatUsers } from '../translations/users.js';
import { deleteResponse } from '../utils/channels.js';
import { getConfigProperty, getRoleProperty } from '../utils/config.js';
import { getGuild, getMemberFromGuild } from '../utils/guild.js';
import { logger } from '../utils/logger.js';
import { isMemberAdmin, isMemberBarred } from '../utils/members.js';
import { safeReplyToInteraction } from '../utils/messages.js';
import {
  abstainAllMissingVotes,
  createPollChoices,
  decidePoll,
  specialPollOptions,
  specialPollTypes,
  startSpecialPoll,
} from '../utils/polls.js';
import { getMembersByRoleIds } from '../utils/roles.js';
import { isNotNullish } from '../utils/utils.js';
import {
  type ChatInputCommandInteraction,
  ComponentType,
  roleMention,
  SlashCommandBuilder,
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
          .addChoices(...createPollChoices(specialPollTypes)),
      )
      .addStringOption((option) =>
        option
          .setName('decision')
          .setDescription('Одлука')
          .setRequired(false)
          .addChoices(...createPollChoices(specialPollOptions)),
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
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('unbar')
      .setDescription(commandDescriptions['special unbar'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(true),
      ),
  );

const handleSpecialList = async (interaction: ChatInputCommandInteraction) => {
  const specialPolls = await getSpecialPolls();

  if (specialPolls === null) {
    await interaction.editReply(commandErrors.specialPollsFetchFailed);

    return;
  }

  const pollsPerPage = 8;
  const pages = Math.ceil(specialPolls.length / pollsPerPage);
  const embed = await getSpecialPollListEmbed(specialPolls, 0, pollsPerPage);
  const components = [
    pages === 0 || pages === 1
      ? getPaginationComponents('polls')
      : getPaginationComponents('polls', 'start'),
  ];
  const message = await interaction.editReply({
    components,
    embeds: [embed],
  });
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: await getConfigProperty('buttonIdleTime'),
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  collector.on('collect', async (buttonInteraction) => {
    if (
      buttonInteraction.user.id !==
      buttonInteraction.message.interaction?.user.id
    ) {
      const mess = await buttonInteraction.reply({
        content: commandErrors.buttonNoPermission,
        ephemeral: true,
      });
      void deleteResponse(mess);

      return;
    }

    const id = buttonInteraction.customId.split(':')[1];

    if (id === undefined) {
      return;
    }

    let buttons;
    let page =
      Number(
        buttonInteraction.message.embeds[0]?.footer?.text?.match(/\d+/gu)?.[0],
      ) - 1;

    if (id === 'first') {
      page = 0;
    } else if (id === 'last') {
      page = pages - 1;
    } else if (id === 'previous') {
      page--;
    } else if (id === 'next') {
      page++;
    }

    if (page === 0 && (pages === 0 || pages === 1)) {
      buttons = getPaginationComponents('polls');
    } else if (page === 0) {
      buttons = getPaginationComponents('polls', 'start');
    } else if (page === pages - 1) {
      buttons = getPaginationComponents('polls', 'end');
    } else {
      buttons = getPaginationComponents('polls', 'middle');
    }

    const nextEmbed = await getSpecialPollListEmbed(
      specialPolls,
      page,
      pollsPerPage,
    );

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(
        logErrorFunctions.interactionUpdateError(
          buttonInteraction.customId,
          error,
        ),
      );
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  collector.on('end', async () => {
    try {
      await message.edit({
        components: [getPaginationComponents('polls')],
      });
    } catch (error) {
      logger.error(logErrorFunctions.collectorEndError(name, error));
    }
  });
};

const handleSpecialDelete = async (
  interaction: ChatInputCommandInteraction,
) => {
  const pollId = interaction.options.getString('poll', true);

  const specialPoll =
    (await getSpecialPollByPollId(pollId)) ??
    (await getSpecialPollById(pollId));

  if (specialPoll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const deletedSpecialPoll = await deleteSpecialPoll(specialPoll.id);
  const deletedPoll = await deletePoll(specialPoll.pollId);

  if (deletedSpecialPoll === null || deletedPoll === null) {
    await interaction.editReply(commandErrors.pollDeletionFailed);

    return;
  }

  await interaction.editReply(commandResponses.pollDeleted);
};

const handleSpecialOverride = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser('user', true);
  const type = interaction.options.getString('type', true);
  const decision = interaction.options.getString('decision');

  const specialPoll = await getSpecialPollByUserAndType(user.id, type);
  const poll = await getPollById(specialPoll?.pollId);

  if (specialPoll === null || poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  if (decision === null) {
    await abstainAllMissingVotes(poll.id);
    await decidePoll(poll.id);
  } else {
    poll.decision = decision;
    poll.done = true;

    await updatePoll(poll);
  }

  const member = await getMemberFromGuild(specialPoll.userId, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  const newPoll = await getPollById(poll.id);

  if (newPoll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  await handlePollButtonForSpecialVote(newPoll, member);

  await interaction.editReply(
    commandResponseFunctions.pollOverriden(newPoll.decision ?? labels.unknown),
  );
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
  const poll = await getPollById(pollId);

  if (poll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const specialPoll = await getSpecialPollByPollId(pollId);

  if (specialPoll === null) {
    await interaction.editReply(commandErrors.pollNotFound);

    return;
  }

  const votes = await getPollVotesByPollId(pollId);

  if (votes === null) {
    await interaction.editReply(commandErrors.pollVotesFetchFailed);

    return;
  }

  const voters = votes.map((vote) => vote.userId);
  const allVoters = await getMembersByRoleIds(guild, poll.roles);
  const missingVoters = allVoters.filter((voter) => !voters.includes(voter));
  const missingVotersMembers = missingVoters
    .map((id) => guild.members.cache.get(id))
    .filter(isNotNullish);
  const missingVotersFormatted = formatUsers(
    labels.remaining,
    missingVotersMembers.map(({ user }) => user),
  );

  await safeReplyToInteraction(interaction, missingVotersFormatted);
};

const handleSpecialBar = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user', true);

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

  const pollId = await startSpecialPoll(interaction, user, 'bar');

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

const handleSpecialUnbar = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser('user', true);

  if (!(await isMemberBarred(user.id))) {
    await interaction.editReply(commandErrors.userNotBarred);

    return;
  }

  const pollId = await startSpecialPoll(interaction, user, 'unbar');

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
