import { Poll } from '../entities/Poll.js';
import { PollOption } from '../entities/PollOption.js';
import { PollVote } from '../entities/PollVote.js';
import { Reminder } from '../entities/Reminder.js';
import { logger } from './logger.js';
import { type ChatInputCommandInteraction } from 'discord.js';
import { env } from 'node:process';
import { DataSource } from 'typeorm';

const db = env['POSTGRES_DB'];
const user = env['POSTGRES_USER'];
const pass = env['POSTGRES_PASSWORD'];

let database: DataSource | undefined;

// Main

export async function initializeDatabase () {
  if (db === undefined || user === undefined || pass === undefined) {
    logger.warn('Database login information is blank. Some features may not work');
    return;
  }

  database = new DataSource({
    database: db,
    entities: ['./dist/entities/*.js'],
    host: 'db',
    logger: 'file',
    logging: true,
    password: pass,
    port: 5_432,
    synchronize: true,
    type: 'postgres',
    username: user
  });

  try {
    await database.initialize();
    await database.synchronize();
    logger.info('Database connection successful');
  } catch (error) {
    logger.warn(`Database connection failed. Some features may not work\n${error}`);
  }
}

// Polls: create

export async function createPoll (interaction: ChatInputCommandInteraction, title: string, description: string, anonymous: boolean, multiple: boolean, open: boolean, options: string[]) {
  if (database === undefined) {
    return null;
  }

  const p = new Poll();
  p.title = title;
  p.description = description;
  p.anonymous = anonymous;
  p.multiple = multiple;
  p.open = open;
  p.owner = interaction.user.id;
  p.options = options.map((o) => {
    const option = new PollOption();
    option.name = o;
    return option;
  });

  await database
    .getRepository(Poll)
    .save(p);

  return p;
}

export async function createPollVote (poll: Poll, option: string, userId: string) {
  if (database === undefined) {
    logger.info(1);
    return null;
  }

  const pollOption = await getPollOption(poll, option);

  if (pollOption === null) {
    return null;
  }

  const p = new PollVote();
  p.option = pollOption;
  p.user = userId;

  await database
    .getRepository(PollVote)
    .save(p);

  return p;
}

// Polls: save

export async function savePoll (poll: Poll) {
  if (database === undefined) {
    return null;
  }

  await database
    .getRepository(Poll)
    .save(poll);

  return poll;
}

// Polls: get

export async function getPoll (id?: string) {
  if (database === undefined || id === undefined) {
    return null;
  }

  return await database
    .getRepository(Poll)
    .findOne({
      relations: { options: true },
      where: { id }
    });
}

export async function getPollOption (poll: Poll, name: string) {
  if (database === undefined) {
    return null;
  }

  return await database
    .getRepository(PollOption)
    .findOne({
      relations: { poll: true },
      where: {
        name,
        poll
      }
    });
}

export async function getPollVotesByUser (poll: Poll, userId: string) {
  if (database === undefined) {
    return [];
  }

  return await database
    .getRepository(PollVote)
    .find({
      relations: {
        option: true
      },
      where: {
        option: { poll },
        user: userId
      }
    });
}

export async function getPollVotes (poll: Poll) {
  if (database === undefined) {
    return [];
  }

  return await database
    .getRepository(PollVote)
    .findBy({ option: { poll } });
}

export async function getPollVotesByOption (option: PollOption) {
  if (database === undefined) {
    return [];
  }

  return await database
    .getRepository(PollVote)
    .findBy({ option });
}

// Polls: delete

export async function deletePoll (id: string) {
  if (database === undefined) {
    return false;
  }

  await database
    .getRepository(Poll)
    .delete({ id });

  return true;
}

export async function deletePollOption (poll: Poll, name: string) {
  if (database === undefined) {
    return false;
  }

  await database
    .getRepository(PollOption)
    .delete({
      name,
      poll
    });

  return true;
}

export async function deletePollVote (vote?: PollVote) {
  if (database === undefined || vote === undefined) {
    return false;
  }

  await database
    .getRepository(PollVote)
    .delete(vote);

  return true;
}

// Reminders

export async function loadReminders () {
  if (database === undefined) {
    return [];
  }

  return await database
    .getRepository(Reminder)
    .find();
}

export async function saveReminder (reminder: Reminder) {
  if (database === undefined) {
    return null;
  }

  await database
    .getRepository(Reminder)
    .save(reminder);

  return reminder;
}

export async function deleteReminders (...reminders: Reminder[]) {
  if (database === undefined) {
    return false;
  }

  for (const reminder of reminders) {
    await database
      .getRepository(Reminder)
      .delete(reminder);
  }

  return true;
}
