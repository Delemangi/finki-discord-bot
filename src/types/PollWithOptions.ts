import { type Poll, type PollOption } from '@prisma/client';

export type PollWithOptions = {
  options: PollOption[];
} & Poll;
