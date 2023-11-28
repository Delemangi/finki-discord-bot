import { createPoll, getPollById, updatePoll } from "../data/Poll.js";
import { countPollVotesByOptionId } from "../data/PollVote.js";
import { createVipPoll, getVipPollByPollId } from "../data/VipPoll.js";
import { client } from "./client.js";
import { getConfigProperty, getRoleProperty } from "./config.js";
import { getMembersWithRoles } from "./roles.js";
import { shortStrings, vipStringFunctions } from "./strings.js";
import { type Prisma } from "@prisma/client";
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type User,
} from "discord.js";

export const managedPollOptions = [
  shortStrings.yes,
  shortStrings.no,
  shortStrings.abstain,
];

export const managedPollTypes = [
  "vipAdd",
  "vipRemove",
  "councilAdd",
  "vipBan",
  "vipUnban",
  "councilRemove",
];

export const createPollChoices = (choices: string[]) => {
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

export const startVipPoll = async (
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
    case "add":
      title = vipStringFunctions.vipAddTitle(vipUser.tag);
      description = vipStringFunctions.vipAddDescription(partialUser);
      break;

    case "remove":
      title = vipStringFunctions.vipRemoveTitle(vipUser.tag);
      description = vipStringFunctions.vipRemoveDescription(partialUser);
      break;

    case "upgrade":
      title = vipStringFunctions.vipUpgradeTitle(vipUser.tag);
      description = vipStringFunctions.vipUpgradeDescription(partialUser);
      break;

    case "ban":
      title = vipStringFunctions.vipBanTitle(vipUser.tag);
      description = vipStringFunctions.vipBanDescription(partialUser);
      break;

    case "unban":
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
          name: "Да",
        },
        {
          name: "Не",
        },
        {
          name: "Воздржан",
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

  const vipPoll: Prisma.VipPollCreateInput = {
    poll: {
      connect: {
        id: createdPoll.id,
      },
    },
    type,
    userId: vipUser.id,
  };

  const createdVipPoll = await createVipPoll(vipPoll);

  if (createdVipPoll === null) {
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
    poll.options.find((option) => option.name === "Воздржан")?.id ?? "",
  );
  const rawThreshold =
    (totalVoters.length - (abstenstions ?? 0)) * poll.threshold;
  const threshold = Number.isInteger(rawThreshold)
    ? rawThreshold + 1
    : Math.ceil(rawThreshold);

  const vipPoll = await getVipPollByPollId(pollId);

  if (vipPoll === null) {
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

  const vipPoll = await getVipPollByPollId(pollId);

  if (vipPoll === null) {
    return;
  }

  poll.decision = "Не";
  await updatePoll(poll);
};
