import { getPollById } from '../data/Poll.js';
import { getSpecialPolls } from '../data/SpecialPoll.js';
import { handlePollButtonForSpecialVote } from '../interactions/button.js';
import { labels } from '../translations/labels.js';
import { logMessageFunctions } from '../translations/logs.js';
import { getMemberFromGuild } from './guild.js';
import { logger } from './logger.js';
import { abstainAllMissingVotes, decidePoll } from './polls.js';
import { type SpecialPoll } from '@prisma/client';
import { setTimeout } from 'node:timers/promises';

const handleSpecialPolls = async (specialPolls: SpecialPoll[]) => {
  for (const specialPoll of specialPolls) {
    if (
      specialPoll.timestamp === null ||
      specialPoll.timestamp?.getTime() > Date.now()
    ) {
      return;
    }

    await abstainAllMissingVotes(specialPoll.pollId);
    await decidePoll(specialPoll.pollId);

    const member = await getMemberFromGuild(specialPoll.userId);
    const newPoll = await getPollById(specialPoll.pollId);

    if (member === null || newPoll === null) {
      return;
    }

    await handlePollButtonForSpecialVote(newPoll, member);

    logger.info(
      logMessageFunctions.specialPollOverriden(
        specialPoll.type,
        specialPoll.userId,
        newPoll.decision ?? labels.unknown,
      ),
    );
  }
};

export const closeSpecialPolls = async () => {
  while (true) {
    const specialPolls = await getSpecialPolls();

    if (specialPolls === null) {
      await setTimeout(30_000);
      continue;
    }

    await handleSpecialPolls(specialPolls);

    await setTimeout(30_000);
  }
};
