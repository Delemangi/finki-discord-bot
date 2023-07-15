import { Experience } from '../models/Experience.js';
import { Poll } from '../models/Poll.js';
import { PollOption } from '../models/PollOption.js';
import { PollVote } from '../models/PollVote.js';
import { Reminder } from '../models/Reminder.js';
import { VipPoll } from '../models/VipPoll.js';
import { client } from './client.js';
import { getFromBotConfig } from './config.js';
import { logger } from './logger.js';
import { getMembersWithRoles } from './roles.js';
import {
  type ChatInputCommandInteraction,
  type Interaction,
  type User,
  userMention,
} from 'discord.js';
import { env } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { DataSource } from 'typeorm';

const database = env['POSTGRES_DB'];
const user = env['POSTGRES_USER'];
const pass = env['POSTGRES_PASSWORD'];

let dataSource: DataSource | undefined;

// Main

export const initializeDatabase = async () => {
  if (database === undefined || user === undefined || pass === undefined) {
    logger.warn(
      'Database login information is blank. Some features may not work',
    );
    return;
  }

  while (true) {
    dataSource = new DataSource({
      database,
      entities: ['./dist/entities/*.js'],
      host: 'postgres',
      logger: 'file',
      logging: true,
      password: pass,
      port: 5_432,
      synchronize: true,
      type: 'postgres',
      username: user,
    });

    try {
      await dataSource.initialize();
      await dataSource.synchronize();
      logger.info('Database connection successful');
      break;
    } catch (error) {
      logger.warn(
        `Database connection failed. Some features may not work. Retrying in 15 seconds\n${error}`,
      );
      await setTimeout(15_000);
    }
  }
};

// Polls: save

export const savePoll = async (poll: Poll) => {
  if (dataSource === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(Poll).save(poll);
  } catch (error) {
    logger.error(`Failed saving poll\n${error}`);
    return null;
  }
};

// Polls: get

export const getAllPolls = async () => {
  if (dataSource === undefined) {
    return [];
  }

  try {
    return await dataSource.getRepository(Poll).find({
      relations: { options: true },
    });
  } catch (error) {
    logger.error(`Failed obtaining all polls\n${error}`);
    return [];
  }
};

export const getPollById = async (pollId?: string) => {
  if (dataSource === undefined || pollId === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(Poll).findOne({
      relations: { options: true },
      where: { id: pollId },
    });
  } catch (error) {
    logger.error(`Failed obtaining poll by poll ID\n${error}`);
    return null;
  }
};

export const getVipPollByUserAndType = async (
  userId?: string,
  type?: string,
) => {
  if (dataSource === undefined || userId === undefined || type === undefined) {
    return null;
  }

  try {
    return await dataSource
      .getRepository(VipPoll)
      .findOneBy({ type, user: userId });
  } catch (error) {
    logger.error(`Failed obtaining VIP poll by user ID\n${error}`);
    return null;
  }
};

export const getVipPollById = async (pollId?: string) => {
  if (dataSource === undefined || pollId === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(VipPoll).findOneBy({ id: pollId });
  } catch (error) {
    logger.error(`Failed obtaining VIP poll by poll ID\n${error}`);
    return null;
  }
};

export const getPollOptionByName = async (
  pollId?: string,
  optionName?: string,
) => {
  if (
    dataSource === undefined ||
    pollId === undefined ||
    optionName === undefined
  ) {
    return null;
  }

  try {
    return await dataSource.getRepository(PollOption).findOne({
      relations: { poll: true },
      where: {
        name: optionName,
        poll: { id: pollId },
      },
    });
  } catch (error) {
    logger.error(
      `Failed obtaining poll option by poll ID and option name\n${error}`,
    );
    return null;
  }
};

export const getPollOptionById = async (optionId?: string) => {
  if (dataSource === undefined || optionId === undefined) {
    return null;
  }

  try {
    return await dataSource
      .getRepository(PollOption)
      .findOneBy({ id: optionId });
  } catch (error) {
    logger.error(`Failed obtaining poll option ID\n${error}`);
    return null;
  }
};

export const getPollVotesByUser = async (pollId?: string, userId?: string) => {
  if (
    dataSource === undefined ||
    pollId === undefined ||
    userId === undefined
  ) {
    return [];
  }

  try {
    return await dataSource.getRepository(PollVote).find({
      relations: {
        option: true,
      },
      where: {
        option: { poll: { id: pollId } },
        user: userId,
      },
    });
  } catch (error) {
    logger.error(
      `Failed obtaining poll votes by poll ID and user ID\n${error}`,
    );
    return [];
  }
};

export const getPollVotesByPollId = async (pollId?: string) => {
  if (dataSource === undefined || pollId === undefined) {
    return [];
  }

  try {
    return await dataSource.getRepository(PollVote).find({
      relations: { option: true },
      where: { option: { poll: { id: pollId } } },
    });
  } catch (error) {
    logger.error(`Failed obtaining poll votes by poll ID\n${error}`);
    return [];
  }
};

export const getPollVotesByOption = async (optionId?: string) => {
  if (dataSource === undefined || optionId === undefined) {
    return [];
  }

  try {
    return await dataSource
      .getRepository(PollVote)
      .findBy({ option: { id: optionId } });
  } catch (error) {
    logger.error(`Failed obtaining poll votes by option ID\n${error}`);
    return [];
  }
};

export const getMostPopularPollOption = async (poll: Poll) => {
  const votes: { [index: string]: number } = {};

  for (const option of poll.options) {
    votes[option.name] = (await getPollVotesByOption(option.id)).length;
  }

  const decision = Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .find(([, count]) => count !== 0);

  return decision === undefined ? null : decision[0];
};

// Polls: decide

export const decidePoll = async (poll: Poll, interaction: Interaction) => {
  if (poll.roles.length === 0) {
    return;
  }

  const votes: { [index: string]: number } = {};
  const totalVoters = await getMembersWithRoles(
    interaction.guild,
    ...poll.roles,
  );
  const threshold = Math.ceil(totalVoters.length * poll.threshold);

  for (const option of poll.options) {
    votes[option.name] = (await getPollVotesByOption(option.id)).length;
  }

  const decision = Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .find(([, numberVotes]) => numberVotes > threshold);

  if (Object.keys(votes).length === totalVoters.length) {
    poll.done = true;

    await savePoll(poll);
    return;
  }

  if (decision !== undefined) {
    poll.done = true;
    poll.decision = decision[0];

    await savePoll(poll);
  }
};

// Polls: create

export const createPoll = async (
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
  if (dataSource === undefined) {
    return null;
  }

  const poll = new Poll();
  poll.title = title;
  poll.description = description;
  poll.anonymous = anonymous;
  poll.multiple = multiple;
  poll.open = open;
  poll.owner = interaction.user.id;
  poll.options = options.map((opt) => {
    const option = new PollOption();
    option.name = opt;
    return option;
  });
  poll.roles = roles;
  poll.done = false;
  poll.threshold = threshold;

  try {
    return await dataSource.getRepository(Poll).save(poll);
  } catch (error) {
    logger.error(`Failed creating poll\n${error}`);
    return null;
  }
};

export const createVipPoll = async (
  vipUser: User,
  type: string,
  threshold?: number,
) => {
  if (dataSource === undefined) {
    return null;
  }

  const existingPoll = await getVipPollByUserAndType(vipUser.id, type);

  if (existingPoll !== null) {
    return null;
  }

  const poll = new Poll();

  const yes = new PollOption();
  yes.name = 'Да';

  const no = new PollOption();
  no.name = 'Не';

  if (type === 'add' || type === 'forceAdd') {
    poll.title = `Влез во ВИП за ${vipUser.tag}`;
    poll.description = `Дали сте за да стане корисникот ${
      vipUser.tag
    } (${userMention(vipUser.id)}) член на ВИП?`;
  } else if (type === 'remove') {
    poll.title = `Недоверба против ${vipUser.tag}`;
    poll.description = `Дали сте за да биде корисникот ${
      vipUser.tag
    } (${userMention(vipUser.id)}) избркан од ВИП?`;
  } else if (type === 'upgrade') {
    poll.title = `Гласачки права за ${vipUser.tag}`;
    poll.description = `Дали сте за да му биде дадено право на глас на корисникот ${
      vipUser.tag
    } (${userMention(vipUser.id)})?`;
  } else {
    poll.title = `Непознат тип на анкета за ${vipUser.tag}`;
    poll.description = 'Настана некоја грешка со анкетата.';
  }

  poll.anonymous = true;
  poll.multiple = false;
  poll.open = false;
  poll.owner = client.user?.id ?? '';
  poll.options = [yes, no];
  poll.roles = [getFromBotConfig('roles').vipVoting];
  poll.done = false;
  poll.threshold = threshold ?? 0.5;

  const savedPoll = await dataSource.getRepository(Poll).save(poll);

  const vipPoll = new VipPoll();
  vipPoll.id = savedPoll.id;
  vipPoll.user = vipUser.id;
  vipPoll.type = type;

  try {
    await dataSource.getRepository(VipPoll).save(vipPoll);
    return poll;
  } catch (error) {
    logger.error(`Failed creating VIP poll\n${error}`);
    return null;
  }
};

export const createPollVote = async (optionId?: string, userId?: string) => {
  if (
    dataSource === undefined ||
    optionId === undefined ||
    userId === undefined
  ) {
    logger.info(1);
    return null;
  }

  const pollOption = await getPollOptionById(optionId);

  if (pollOption === null) {
    return null;
  }

  const pollVote = new PollVote();
  pollVote.option = pollOption;
  pollVote.user = userId;

  try {
    return await dataSource.getRepository(PollVote).save(pollVote);
  } catch (error) {
    logger.error(`Failed creating poll vote\n${error}`);
    return null;
  }
};

// Polls: delete

export const deletePoll = async (pollId?: string) => {
  if (dataSource === undefined || pollId === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(Poll).delete({ id: pollId });
  } catch (error) {
    logger.error(`Failed deleting poll by poll ID\n${error}`);
    return null;
  }
};

export const deleteVipPoll = async (pollId?: string) => {
  if (dataSource === undefined || pollId === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(VipPoll).delete({ id: pollId });
  } catch (error) {
    logger.error(`Failed deleting VIP poll by poll ID\n${error}`);
    return null;
  }
};

export const deletePollOption = async (
  pollId?: string,
  optionName?: string,
) => {
  if (
    dataSource === undefined ||
    pollId === undefined ||
    optionName === undefined
  ) {
    return null;
  }

  try {
    return await dataSource.getRepository(PollOption).delete({
      name: optionName,
      poll: { id: pollId },
    });
  } catch (error) {
    logger.error(
      `Failed deleting poll option by poll ID and option name\n${error}`,
    );
    return null;
  }
};

export const deletePollVote = async (voteId?: string) => {
  if (dataSource === undefined || voteId === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(PollVote).delete({ id: voteId });
  } catch (error) {
    logger.error(`Failed deleting poll vote by vote ID\n${error}`);
    return null;
  }
};

// Reminders

export const loadReminders = async () => {
  if (dataSource === undefined) {
    return [];
  }

  try {
    return await dataSource.getRepository(Reminder).find();
  } catch (error) {
    logger.error(`Failed loading reminders\n${error}`);
    return [];
  }
};

export const saveReminder = async (reminder?: Reminder) => {
  if (dataSource === undefined || reminder === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(Reminder).save(reminder);
  } catch (error) {
    logger.error(`Failed saving reminder\n${error}`);
    return null;
  }
};

export const deleteReminders = async (...reminders: Reminder[]) => {
  if (dataSource === undefined) {
    return [];
  }

  const deleted = [];
  for (const reminder of reminders) {
    deleted.push(
      await dataSource.getRepository(Reminder).delete({ id: reminder.id }),
    );
  }

  return deleted;
};

// Leveling

export const getExperienceByUserId = async (userId?: string) => {
  if (dataSource === undefined || userId === undefined) {
    return null;
  }

  try {
    return await dataSource
      .getRepository(Experience)
      .findOneBy({ user: userId });
  } catch (error) {
    logger.error(`Failed getting experience by user ID\n${error}`);
    return null;
  }
};

export const addExperienceByUserId = async (
  userId?: string,
  experience: number = 0,
) => {
  if (
    dataSource === undefined ||
    userId === undefined ||
    experience === undefined
  ) {
    return null;
  }

  const level = await getExperienceByUserId(userId);

  if (level === null) {
    return null;
  }

  level.experience = BigInt(level.experience) + BigInt(experience);

  try {
    return await dataSource.getRepository(Experience).save(level);
  } catch (error) {
    logger.error(`Failed adding experience by user ID\n${error}`);
    return null;
  }
};

export const addLevelByUserId = async (userId?: string, level: number = 1) => {
  if (dataSource === undefined || userId === undefined) {
    return null;
  }

  const userLevel = await getExperienceByUserId(userId);

  if (userLevel === null) {
    return null;
  }

  userLevel.level += level;

  try {
    return await dataSource.getRepository(Experience).save(userLevel);
  } catch (error) {
    logger.error(`Failed adding experience by user ID\n${error}`);
    return null;
  }
};

export const saveExperience = async (level?: Experience) => {
  if (dataSource === undefined || level === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(Experience).save(level);
  } catch (error) {
    logger.error(`Failed saving experience\n${error}`);
    return null;
  }
};

export const getExperienceSorted = async (limit: number = 512) => {
  if (dataSource === undefined) {
    return null;
  }

  try {
    return await dataSource
      .getRepository(Experience)
      .find({ order: { experience: 'DESC' }, take: limit });
  } catch (error) {
    logger.error(`Failed getting experience sorted\n${error}`);
    return null;
  }
};

export const getExperienceCount = async () => {
  if (dataSource === undefined) {
    return null;
  }

  try {
    return await dataSource.getRepository(Experience).count();
  } catch (error) {
    logger.error(`Failed getting experience count\n${error}`);
    return null;
  }
};
