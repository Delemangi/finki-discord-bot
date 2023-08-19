import { type PollWithOptions } from "../types/PollWithOptions.js";
import { logger } from "../utils/logger.js";
import { getMembersWithRoles } from "../utils/roles.js";
import { database } from "./database.js";
import { getPollVotesByOptionId } from "./PollVote.js";
import { type Prisma } from "@prisma/client";
import { type Interaction } from "discord.js";

export const createPoll = async (poll?: Prisma.PollCreateInput) => {
  if (poll === undefined) {
    return null;
  }

  try {
    return await database.poll.create({
      data: poll,
    });
  } catch (error) {
    logger.error(`Failed creating poll\n${error}`);
    return null;
  }
};

export const updatePoll = async (poll?: PollWithOptions) => {
  if (poll === undefined) {
    return null;
  }

  try {
    const { id, options, ...rest } = poll;
    return await database.poll.update({
      data: {
        ...rest,
        options: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          upsert: options.map(({ pollId, ...optionRest }) => ({
            create: optionRest,
            update: optionRest,
            where: {
              id: optionRest.id,
            },
          })),
        },
      },
      where: {
        id,
      },
    });
  } catch (error) {
    logger.error(`Failed updating poll\n${error}`);
    return null;
  }
};

export const getPolls = async () => {
  try {
    return await database.poll.findMany();
  } catch (error) {
    logger.error(`Failed loading polls\n${error}`);
    return [];
  }
};

export const getPollById = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    return await database.poll.findUnique({
      include: {
        options: true,
      },
      where: {
        id: pollId,
      },
    });
  } catch (error) {
    logger.error(`Failed obtaining poll by poll ID\n${error}`);
    return null;
  }
};

export const decidePoll = async (pollId: string, interaction: Interaction) => {
  const poll = await getPollById(pollId);

  if (poll === null) {
    return;
  }

  if (poll.roles.length === 0) {
    return;
  }

  const votes: { [index: string]: number } = {};
  const totalVoters = await getMembersWithRoles(
    interaction.guild,
    ...poll.roles
  );
  const threshold = Math.ceil(totalVoters.length * poll.threshold);

  for (const option of poll.options) {
    votes[option.name] = (await getPollVotesByOptionId(option.id)).length;
  }

  const decision = Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .find(([, numberVotes]) => numberVotes > threshold);

  if (Object.keys(votes).length === totalVoters.length) {
    poll.done = true;

    await updatePoll(poll);
    return;
  }

  if (decision !== undefined) {
    poll.done = true;
    poll.decision = decision[0];

    await updatePoll(poll);
  }
};

export const deletePoll = async (pollId?: string) => {
  if (pollId === undefined) {
    return null;
  }

  try {
    return await database.poll.delete({
      where: {
        id: pollId,
      },
    });
  } catch (error) {
    logger.error(`Failed deleting poll\n${error}`);
    return null;
  }
};
