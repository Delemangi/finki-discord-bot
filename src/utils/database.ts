import { Poll } from '../entities/Poll.js';
import { PollOption } from '../entities/PollOption.js';
import { PollVote } from '../entities/PollVote.js';
import { Reminder } from '../entities/Reminder.js';
import { VipPoll } from '../entities/VipPoll.js';
import { logger } from './logger.js';
import {
  type ChatInputCommandInteraction,
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

// Polls: get

export const getPoll = async (id?: string) => {
  if (dataSource === undefined || id === undefined) {
    return null;
  }

  return await dataSource.getRepository(Poll).findOne({
    relations: { options: true },
    where: { id },
  });
};

export const getVipPollByUser = async (userId?: string) => {
  if (dataSource === undefined || userId === undefined) {
    return null;
  }

  return await dataSource.getRepository(VipPoll).findOneBy({ user: userId });
};

export const getVipPollById = async (id?: string) => {
  if (dataSource === undefined || id === undefined) {
    return null;
  }

  return await dataSource.getRepository(VipPoll).findOneBy({ id });
};

export const getPollOption = async (poll: Poll, name: string) => {
  if (dataSource === undefined) {
    return null;
  }

  return await dataSource.getRepository(PollOption).findOne({
    relations: { poll: true },
    where: {
      name,
      poll: { id: poll.id },
    },
  });
};

export const getPollVotesByUser = async (poll: Poll, userId: string) => {
  if (dataSource === undefined) {
    return [];
  }

  return await dataSource.getRepository(PollVote).find({
    relations: {
      option: true,
    },
    where: {
      option: { poll: { id: poll.id } },
      user: userId,
    },
  });
};

export const getPollVotes = async (poll: Poll) => {
  if (dataSource === undefined) {
    return [];
  }

  return await dataSource.getRepository(PollVote).find({
    relations: { option: true },
    where: { option: { poll: { id: poll.id } } },
  });
};

export const getPollVotesByOption = async (option: PollOption) => {
  if (dataSource === undefined) {
    return [];
  }

  return await dataSource
    .getRepository(PollVote)
    .findBy({ option: { id: option.id } });
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

  await dataSource.getRepository(Poll).save(poll);

  return poll;
};

export const createVipPoll = async (vipUser: User) => {
  if (dataSource === undefined) {
    return null;
  }

  const poll = new Poll();

  const yes = new PollOption();
  yes.name = 'Да';

  const no = new PollOption();
  no.name = 'Не';

  const abstain = new PollOption();
  abstain.name = 'Воздржан';

  poll.title = `Влез во ВИП за ${vipUser.tag}`;
  poll.description = `Дали сте за да стане корисникот ${
    vipUser.tag
  } (${userMention(vipUser.id)}) член на ВИП?`;
  poll.anonymous = true;
  poll.multiple = false;
  poll.open = false;
  poll.owner = vipUser.id;
  poll.options = [yes, no, abstain];
  poll.roles = ['1044418333581254676'];
  poll.done = false;

  const savedPoll = await dataSource.getRepository(Poll).save(poll);

  const vipPoll = new VipPoll();
  vipPoll.id = savedPoll.id;
  vipPoll.user = vipUser.id;

  await dataSource.getRepository(VipPoll).save(vipPoll);

  return poll;
};

export const createPollVote = async (
  poll: Poll,
  option: string,
  userId: string,
) => {
  if (dataSource === undefined) {
    logger.info(1);
    return null;
  }

  const pollOption = await getPollOption(poll, option);

  if (pollOption === null) {
    return null;
  }

  const pollVote = new PollVote();
  pollVote.option = pollOption;
  pollVote.user = userId;

  await dataSource.getRepository(PollVote).save(pollVote);

  return pollVote;
};

// Polls: save

export const savePoll = async (poll: Poll) => {
  if (dataSource === undefined) {
    return null;
  }

  await dataSource.getRepository(Poll).save(poll);

  return poll;
};

// Polls: delete

export const deletePoll = async (id: string) => {
  if (dataSource === undefined) {
    return false;
  }

  await dataSource.getRepository(Poll).delete({ id });

  return true;
};

export const deleteVipPoll = async (id: string) => {
  if (dataSource === undefined) {
    return false;
  }

  await dataSource.getRepository(VipPoll).delete({ id });

  return true;
};

export const deletePollOption = async (poll: Poll, name: string) => {
  if (dataSource === undefined) {
    return false;
  }

  await dataSource.getRepository(PollOption).delete({
    name,
    poll: { id: poll.id },
  });

  return true;
};

export const deletePollVote = async (vote?: PollVote) => {
  if (dataSource === undefined || vote === undefined) {
    return false;
  }

  await dataSource.getRepository(PollVote).delete({ id: vote.id });

  return true;
};

// Reminders

export const loadReminders = async () => {
  if (dataSource === undefined) {
    return [];
  }

  return await dataSource.getRepository(Reminder).find();
};

export const saveReminder = async (reminder: Reminder) => {
  if (dataSource === undefined) {
    return null;
  }

  await dataSource.getRepository(Reminder).save(reminder);

  return reminder;
};

export const deleteReminders = async (...reminders: Reminder[]) => {
  if (dataSource === undefined) {
    return false;
  }

  for (const reminder of reminders) {
    await dataSource.getRepository(Reminder).delete({ id: reminder.id });
  }

  return true;
};
