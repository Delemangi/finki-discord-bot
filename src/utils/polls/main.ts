import {
  type InteractionEditReplyOptions,
  type Poll,
  PollLayoutType,
  type User,
} from 'discord.js';

import { getRolesProperty } from '../../configuration/main.js';
import { Channel } from '../../lib/schemas/Channel.js';
import { PollType, PollTypeSchema } from '../../lib/schemas/PollType.js';
import { Role } from '../../lib/schemas/Role.js';
import { type PartialUser } from '../../lib/types/PartialUser.js';
import { logger } from '../../logger.js';
import { labels } from '../../translations/labels.js';
import { logMessages } from '../../translations/logs.js';
import { specialStringFunctions } from '../../translations/special.js';
import { getChannel } from '../channels.js';
import { getGuild, getMemberFromGuild } from '../guild.js';
import { ADMIN_OVERRIDE_LEVEL } from '../levels.js';
import { isMemberLevel } from '../members.js';
import { POLL_IDENTIFIER_REGEX } from '../regex.js';
import { getMembersByRoleIds } from '../roles.js';
import { executePollAction } from './actions.js';

export const initializePolls = async () => {
  const councilChannel = getChannel(Channel.Council);

  if (councilChannel === undefined) {
    return;
  }

  await councilChannel.messages.fetch();

  logger.info(logMessages.pollsInitialized);
};

const getPollIdentifier = (
  pollType: PollType,
  userId: string,
): `[${PollType}-${string}]` => `[${pollType}-${userId}]`;

const getPollTypeThreshold = (pollType: PollType) => {
  switch (pollType) {
    case PollType.VIP_ADD:
    case PollType.VIP_REMOVE:
    case PollType.VIP_REQUEST:
      return 0.67;

    default:
      return 0.5;
  }
};

export const getPollInformation = (pollText: string) => {
  const results = POLL_IDENTIFIER_REGEX.exec(pollText);

  if (results === null) {
    return {
      pollType: null,
      userId: null,
    };
  }

  const [pollType, userId] = results[0].slice(1, -1).split('-');
  const parsedPollType = PollTypeSchema.safeParse(pollType);

  return {
    pollType: parsedPollType.data ?? null,
    userId: userId ?? null,
  };
};

export const getPollText = (
  pollType: PollType,
  partialUser: PartialUser,
): {
  description: string;
  title: string;
} => {
  const { tag: userTag } = partialUser;

  switch (pollType) {
    case PollType.ADMIN_ADD:
      return {
        description: specialStringFunctions.adminAddDescription(userTag),
        title: specialStringFunctions.adminAddTitle(partialUser),
      };
    case PollType.ADMIN_REMOVE:
      return {
        description: specialStringFunctions.adminRemoveDescription(userTag),
        title: specialStringFunctions.adminRemoveTitle(partialUser),
      };

    case PollType.BAR:
      return {
        description: specialStringFunctions.barDescription(userTag),
        title: specialStringFunctions.barTitle(partialUser),
      };

    case PollType.COUNCIL_ADD:
      return {
        description: specialStringFunctions.councilAddDescription(userTag),
        title: specialStringFunctions.councilAddTitle(partialUser),
      };

    case PollType.COUNCIL_REMOVE:
      return {
        description: specialStringFunctions.councilRemoveDescription(userTag),
        title: specialStringFunctions.councilRemoveTitle(partialUser),
      };

    case PollType.IRREGULARS_ADD:
    case PollType.IRREGULARS_REQUEST:
      return {
        description: specialStringFunctions.irregularsAddDescription(userTag),
        title: specialStringFunctions.irregularsAddTitle(partialUser),
      };

    case PollType.IRREGULARS_REMOVE:
      return {
        description:
          specialStringFunctions.irregularsRemoveDescription(userTag),
        title: specialStringFunctions.irregularsRemoveTitle(partialUser),
      };

    case PollType.UNBAR:
      return {
        description: specialStringFunctions.unbarDescription(userTag),
        title: specialStringFunctions.unbarTitle(partialUser),
      };

    case PollType.VIP_ADD:
    case PollType.VIP_REQUEST:
      return {
        description: specialStringFunctions.vipAddDescription(userTag),
        title: specialStringFunctions.vipAddTitle(partialUser),
      };

    case PollType.VIP_REMOVE:
      return {
        description: specialStringFunctions.vipRemoveDescription(userTag),
        title: specialStringFunctions.vipRemoveTitle(partialUser),
      };

    default:
      return {
        description: specialStringFunctions.unknownPollDescription(userTag),
        title: specialStringFunctions.unknownPollTitle(partialUser),
      };
  }
};

export const getActivePolls = async () => {
  const channel = getChannel(Channel.Council);

  if (channel === undefined) {
    return [];
  }

  const messages = await channel.messages.fetch();
  const polls = messages
    .map((message) => message.poll)
    .filter((poll) => poll !== null)
    .filter((poll) => !poll.resultsFinalized);

  return polls;
};

export const isPollDuplicate = async (pollType: PollType, userId: string) => {
  const polls = await getActivePolls();
  const identifier = getPollIdentifier(pollType, userId);

  return polls.some((poll) => poll.message.content.includes(identifier));
};

export const createPoll = (pollType: PollType, targetUser: User) => {
  const partialUser = {
    id: targetUser.id,
    tag: targetUser.tag,
  };

  const { description, title } = getPollText(pollType, partialUser);
  const identifier = getPollIdentifier(pollType, targetUser.id);

  return {
    content: `${title}\n-# ${identifier}`,
    poll: {
      allowMultiselect: false,
      answers: [
        {
          emoji: '✅',
          text: labels.yes,
        },
        {
          emoji: '❌',
          text: labels.no,
        },
        {
          emoji: '🤐',
          text: labels.abstain,
        },
      ],
      duration: 24,
      layoutType: PollLayoutType.Default,
      question: {
        text: description,
      },
    },
  } satisfies InteractionEditReplyOptions;
};

export const getMissingVoters = async (poll: Poll) => {
  const votes = await Promise.all(
    poll.answers.map(async (answer) => await answer.fetchVoters()),
  );
  const voters = votes
    .flatMap((vote) => vote.values().toArray())
    .map((voter) => voter.id);

  return voters;
};

const getPollThreshold = async (
  poll: Poll,
  roleId: string,
  abstainMissingVotes: boolean,
) => {
  const guild = poll.message.guild ?? (await getGuild());
  const { pollType } = getPollInformation(poll.message.content);

  if (guild === null || pollType === null) {
    return null;
  }

  const pollTypeThreshold = getPollTypeThreshold(pollType);
  const totalVoters = await getMembersByRoleIds(guild, [roleId]);

  const abstainOption = poll.answers.find(
    (option) => option.text === labels.abstain,
  );
  let abstentions = abstainOption?.voteCount ?? 0;

  if (abstainMissingVotes) {
    const missingVoters = await getMissingVoters(poll);
    abstentions += missingVoters.length;
  }

  if (abstentions >= totalVoters.length / 2) {
    return null;
  }

  const threshold = (totalVoters.length - abstentions) * pollTypeThreshold;

  const normalizedThreshold = Number.isInteger(threshold)
    ? threshold + 1
    : Math.ceil(threshold);

  return normalizedThreshold;
};

export const getAdminVotes = async (poll: Poll) => {
  const guild = poll.message.guild ?? (await getGuild());

  if (guild === null) {
    return null;
  }

  const adminRoleId = getRolesProperty(Role.Administrators);

  if (adminRoleId === undefined) {
    return null;
  }

  const admins = await getMembersByRoleIds(guild, [adminRoleId]);

  const options = await Promise.all(
    poll.answers.map(async (answer) => answer.fetchVoters()),
  );

  const adminVotes: Array<null | string> = [];

  for (const option of options) {
    const votes = option.filter((voter) => admins.includes(voter.id));

    adminVotes.push(...votes.map((vote) => vote.id));
  }

  // for each missing admin vote, add undefined
  for (const admin of admins) {
    if (!adminVotes.includes(admin)) {
      adminVotes.push(null);
    }
  }

  return new Set(adminVotes);
};

const getPollSpecialDecision = async (poll: Poll) => {
  const adminVotes = await getAdminVotes(poll);

  const { pollType, userId } = getPollInformation(poll.message.content);

  if (pollType === null || userId === null) {
    return null;
  }

  const member = await getMemberFromGuild(userId, poll.message.guild);

  if (member === null) {
    return null;
  }

  switch (pollType) {
    case PollType.ADMIN_ADD:
    case PollType.COUNCIL_ADD:
    case PollType.IRREGULARS_ADD:
    case PollType.IRREGULARS_REQUEST:
    case PollType.VIP_ADD:
    case PollType.VIP_REQUEST:
      if (!(await isMemberLevel(member, ADMIN_OVERRIDE_LEVEL))) {
        return null;
      }

      if (
        adminVotes === null ||
        adminVotes.size !== 1 ||
        adminVotes.has(null)
      ) {
        return null;
      }

      return adminVotes.values().next().value ?? null;

    default:
      return null;
  }
};

export const getPollDecision = async (poll: Poll, pollExpired: boolean) => {
  const councilRoleId = getRolesProperty(Role.Council);

  if (councilRoleId === undefined) {
    return null;
  }

  const threshold = await getPollThreshold(poll, councilRoleId, pollExpired);

  if (threshold === null) {
    return null;
  }

  const decision = poll.answers.find((answer) => answer.voteCount >= threshold);

  if (
    decision?.text === undefined ||
    decision.text === null ||
    decision.text === labels.abstain
  ) {
    return null;
  }

  return decision.text;
};

export const decidePoll = async (poll: Poll, expired = false) => {
  const specialDecision = await getPollSpecialDecision(poll);

  if (specialDecision !== null) {
    await executePollAction(poll, specialDecision);

    if (!poll.resultsFinalized) {
      await poll.end();
    }

    return;
  }

  const decision = await getPollDecision(poll, expired);

  if (decision === null) {
    return;
  }

  await executePollAction(poll, decision);

  if (!poll.resultsFinalized && !expired) {
    await poll.end();
  }
};

export const decidePollForcefully = async (
  poll: Poll,
  decision: null | string,
) => {
  if (poll.resultsFinalized) {
    return;
  }

  const chosenDecision = decision ?? (await getPollDecision(poll, true));

  if (chosenDecision === null) {
    return;
  }

  await poll.end();
  await executePollAction(poll, chosenDecision);
};
