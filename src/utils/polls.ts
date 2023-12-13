import { createPoll, getPollById, updatePoll } from "../data/Poll.js";
import {
  countPollVotesByOptionId,
  createPollVote,
  getPollVotesByPollId,
} from "../data/PollVote.js";
import {
  createSpecialPoll,
  getSpecialPollByPollId,
} from "../data/SpecialPoll.js";
import { labels } from "../translations/labels.js";
import { specialStringFunctions } from "../translations/special.js";
import { type PollWithOptions } from "../types/PollWithOptions.js";
import { client } from "./client.js";
import { getRoleProperty } from "./config.js";
import { getGuild, getMemberFromGuild } from "./guild.js";
import { isMemberLevel } from "./members.js";
import { getMembersByRoleIds } from "./roles.js";
import { type Prisma, type SpecialPoll } from "@prisma/client";
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type User,
} from "discord.js";

export const specialPollOptions = [
  labels.yes,
  labels.no,
  labels.abstain,
] as const;

export const specialPollTypes = [
  "vipRequest",
  "vipAdd",
  "vipRemove",
  "councilAdd",
  "councilRemove",
  "adminAdd",
  "adminRemove",
  "bar",
  "unbar",
] as const;

export const createPollChoices = (choices: readonly string[]) => {
  return choices.map((choice) => ({
    name: choice,
    value: choice,
  }));
};

export const startPoll = async (
  interaction: ChatInputCommandInteraction,
  title: string,
  description: string,
  anonymous: boolean,
  multiple: boolean,
  open: boolean,
  options: string[],
  roles: string[],
  threshold: number,
) => {
  const poll: Prisma.PollCreateInput = {
    anonymous,
    channelId: interaction.channelId,
    description,
    multiple,
    open,
    options: {
      create: options.map((opt) => ({
        name: opt,
      })),
    },
    roles,
    threshold,
    title,
    userId: interaction.user.id,
  };

  const createdPoll = await createPoll(poll);

  return createdPoll?.id ?? null;
};

export const startSpecialPoll = async (
  interaction: ButtonInteraction | ChatInputCommandInteraction,
  vipUser: User,
  type: string,
  threshold = 0.5,
  timestamp = new Date(Date.now() + 86_400_000),
) => {
  const partialUser = {
    id: vipUser.id,
    tag: vipUser.tag,
  };

  let title: string;
  let description: string;

  switch (type) {
    case "vipRequest":
    case "vipAdd":
      title = specialStringFunctions.vipAddTitle(vipUser.tag);
      description = specialStringFunctions.vipAddDescription(partialUser);
      break;

    case "vipRemove":
      title = specialStringFunctions.vipRemoveTitle(vipUser.tag);
      description = specialStringFunctions.vipRemoveDescription(partialUser);
      break;

    case "councilAdd":
      title = specialStringFunctions.councilAddTitle(vipUser.tag);
      description = specialStringFunctions.councilAddDescription(partialUser);
      break;

    case "councilRemove":
      title = specialStringFunctions.councilRemoveTitle(vipUser.tag);
      description =
        specialStringFunctions.councilRemoveDescription(partialUser);
      break;

    case "bar":
      title = specialStringFunctions.barTitle(vipUser.tag);
      description = specialStringFunctions.barDescription(partialUser);
      break;

    case "unbar":
      title = specialStringFunctions.unbarTitle(vipUser.tag);
      description = specialStringFunctions.unbarDescription(partialUser);
      break;

    default:
      return null;
  }

  const poll: Prisma.PollCreateInput = {
    anonymous: false,
    channelId: interaction.channelId,
    description,
    done: false,
    multiple: false,
    open: false,
    options: {
      create: [
        {
          name: labels.yes,
        },
        {
          name: labels.no,
        },
        {
          name: labels.abstain,
        },
      ],
    },
    roles: [await getRoleProperty("council")],
    threshold,
    title,
    userId: client.user?.id ?? "",
  };

  const createdPoll = await createPoll(poll);

  if (createdPoll === null) {
    return null;
  }

  const specialPoll: Prisma.SpecialPollCreateInput = {
    poll: {
      connect: {
        id: createdPoll.id,
      },
    },
    timestamp,
    type,
    userId: vipUser.id,
  };

  const createdSpecialPoll = await createSpecialPoll(specialPoll);

  if (createdSpecialPoll === null) {
    return null;
  }

  return createdPoll.id;
};

export const getPollThreshold = async (pollId: string) => {
  const poll = await getPollById(pollId);

  if (poll === null) {
    return null;
  }

  if (poll.roles.length === 0) {
    return null;
  }

  const guild = await getGuild();

  if (guild === null) {
    return null;
  }

  const totalVoters = await getMembersByRoleIds(guild, poll.roles);
  const abstenstions = await countPollVotesByOptionId(
    poll.options.find((option) => option.name === labels.abstain)?.id ?? "",
  );
  const rawThreshold =
    (totalVoters.length - (abstenstions ?? 0)) * poll.threshold;
  const threshold = Number.isInteger(rawThreshold)
    ? rawThreshold + 1
    : Math.ceil(rawThreshold);

  const specialPoll = await getSpecialPollByPollId(pollId);

  if (specialPoll === null) {
    return threshold;
  }

  return threshold;
};

export const getAdminVote = async (pollId: string) => {
  const poll = await getPollById(pollId);

  if (poll === null) {
    return null;
  }

  const guild = await getGuild();

  if (guild === null) {
    return null;
  }

  const adminRoleId = await getRoleProperty("admin");
  const votes = await getPollVotesByPollId(pollId);

  if (votes === null) {
    return null;
  }

  await guild.members.fetch();

  const adminVote = votes.find(
    (vote) =>
      guild.members.cache.get(vote.userId)?.roles.cache.has(adminRoleId),
  );

  return adminVote ?? null;
};

const decideSpecialPollByAdministratorVote = async (
  poll: PollWithOptions,
  specialPoll: SpecialPoll,
) => {
  const member = await getMemberFromGuild(specialPoll.userId);

  switch (specialPoll.type) {
    case "vipRequest":
    case "vipAdd":
      if (member === null || !(await isMemberLevel(member, 15))) {
        return;
      }

      // eslint-disable-next-line no-case-declarations
      const vote = await getAdminVote(specialPoll.pollId);

      if (vote === null || vote.option.name !== labels.yes) {
        return;
      }

      poll.decision = vote.option.name;
      poll.done = true;

      await updatePoll(poll);
      break;

    default:
  }
};

export const decidePoll = async (pollId: string) => {
  const poll = await getPollById(pollId);
  const specialPoll = await getSpecialPollByPollId(pollId);

  if (poll === null || poll.roles.length === 0) {
    return;
  }

  const guild = await getGuild();

  if (guild === null) {
    return;
  }

  const votes: Record<string, number> = {};
  const totalVoters = await getMembersByRoleIds(guild, poll.roles);

  if (specialPoll !== null) {
    await decideSpecialPollByAdministratorVote(poll, specialPoll);
  }

  if (poll.decision !== null) {
    return;
  }

  const threshold = await getPollThreshold(pollId);

  if (threshold === null) {
    return;
  }

  for (const option of poll.options) {
    votes[option.name] = (await countPollVotesByOptionId(option.id)) ?? 0;
  }

  const decision = Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .find(([, numberVotes]) => numberVotes >= threshold);

  if (decision !== undefined) {
    poll.done = true;
    poll.decision = decision[0];

    await updatePoll(poll);

    return;
  }

  const totalVotes = Object.values(votes).reduce(
    (total, optionVotes) => total + optionVotes,
    0,
  );

  if (totalVotes !== totalVoters.length) {
    return;
  }

  poll.done = true;

  if (specialPoll !== null) {
    poll.decision = labels.no;
  }

  await updatePoll(poll);
};

export const abstainAllMissingVotes = async (pollId: string) => {
  const poll = await getPollById(pollId);

  if (poll === null) {
    return;
  }

  const votes = await getPollVotesByPollId(pollId);

  if (votes === null) {
    return;
  }

  const voters = votes.map((vote) => vote.userId);
  const guild = await getGuild();

  if (guild === null) {
    return;
  }

  const allVoters = await getMembersByRoleIds(guild, poll.roles);
  const missingVoters = allVoters.filter((voter) => !voters.includes(voter));

  for (const voter of missingVoters) {
    await createPollVote({
      option: {
        connect: {
          id:
            poll.options.find((option) => option.name === labels.abstain)?.id ??
            "",
        },
      },
      poll: {
        connect: {
          id: pollId,
        },
      },
      userId: voter,
    });
  }
};
