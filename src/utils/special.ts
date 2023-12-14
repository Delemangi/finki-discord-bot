import { getPollById } from '../data/Poll.js';
import { getSpecialPolls } from '../data/SpecialPoll.js';
import { handlePollButtonForSpecialVote } from '../interactions/button.js';
import {
  logErrorFunctions,
  logMessageFunctions,
} from '../translations/logs.js';
import { getMemberFromGuild } from './guild.js';
import { logger } from './logger.js';
import { abstainAllMissingVotes, decidePoll } from './polls.js';
import { setTimeout } from 'node:timers/promises';

export const closeSpecialPolls = async () => {
  while (true) {
    try {
      const specialPolls = await getSpecialPolls();

      if (specialPolls === null) {
        await setTimeout(30_000);
        continue;
      }

      for (const specialPoll of specialPolls) {
        if (
          specialPoll.timestamp !== null &&
          specialPoll.timestamp?.getTime() <= Date.now()
        ) {
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
              newPoll.decision ?? 'unknown',
            ),
          );
        }
      }
    } catch (error) {
      logger.error(logErrorFunctions.specialPollLoadError(error));
    }

    await setTimeout(30_000);
  }
};
