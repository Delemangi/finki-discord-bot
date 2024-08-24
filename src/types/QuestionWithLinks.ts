import { type Question, type QuestionLink } from '@prisma/client';

export type QuestionWithLinks = {
  links: QuestionLink[];
} & Question;
