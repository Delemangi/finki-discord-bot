import { client } from "./client.js";
import { getConfigProperty, getRoleProperty } from "./config.js";
import { getMembersWithRoles } from "./roles.js";
import { createPoll, getPollById, updatePoll } from "@app/data/Poll.js";
import { countPollVotesByOptionId } from "@app/data/PollVote.js";
import {
  createSpecialPoll,
  getSpecialPollByPollId,
} from "@app/data/SpecialPoll.js";
import { labels } from "@app/strings/labels.js";
import { vipStringFunctions } from "@app/strings/vip.js";
import { type Prisma } from "@prisma/client";
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
  "vipAdd",
  "vipRemove",
  "councilAdd",
  "councilRemove",
  "adminAdd",
  "adminRemove",
  "vipBan",
  "vipUnban",
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
  threshold?: number,
) => {
  const partialUser = {
    id: vipUser.id,
    tag: vipUser.tag,
  };

  let title: string;
  let description: string;

  switch (type) {
    case "vipAdd":
      title = vipStringFunctions.vipAddTitle(vipUser.tag);
      description = vipStringFunctions.vipAddDescription(partialUser);
      break;

    case "vipRemove":
      title = vipStringFunctions.vipRemoveTitle(vipUser.tag);
      description = vipStringFunctions.vipRemoveDescription(partialUser);
      break;

    case "councilAdd":
      title = vipStringFunctions.vipUpgradeTitle(vipUser.tag);
      description = vipStringFunctions.vipUpgradeDescription(partialUser);
      break;

    case "vipBan":
      title = vipStringFunctions.vipBanTitle(vipUser.tag);
      description = vipStringFunctions.vipBanDescription(partialUser);
      break;

    case "vipUnban":
      title = vipStringFunctions.vipUnbanTitle(vipUser.tag);
      description = vipStringFunctions.vipUnbanDescription(partialUser);
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
    threshold: threshold ?? 0.5,
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

  const guild = client.guilds.cache.get(await getConfigProperty("guild"));

  if (guild === undefined) {
    return null;
  }

  const totalVoters = await getMembersWithRoles(guild, ...poll.roles);
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

export const decidePoll = async (pollId: string) => {
  const poll = await getPollById(pollId);

  if (poll === null) {
    return;
  }

  if (poll.roles.length === 0) {
    return;
  }

  const guild = client.guilds.cache.get(await getConfigProperty("guild"));

  if (guild === undefined) {
    return;
  }

  const votes: Record<string, number> = {};
  const totalVoters = await getMembersWithRoles(guild, ...poll.roles);
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

  if (totalVotes === totalVoters.length) {
    poll.done = true;

    await updatePoll(poll);
  }

  const specialPoll = await getSpecialPollByPollId(pollId);

  if (specialPoll === null) {
    return;
  }

  poll.decision = labels.no;
  await updatePoll(poll);
};
