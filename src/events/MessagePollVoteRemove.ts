import { type ClientEvents, Events } from 'discord.js';

import { decidePoll } from '../utils/polls/main.js';

export const name = Events.MessagePollVoteRemove;
export const once = true;

export const execute = async (...[answer]: ClientEvents[typeof name]) => {
  await decidePoll(answer.poll);
};
