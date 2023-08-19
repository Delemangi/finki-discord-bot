import { type Question, type QuestionLink } from "@prisma/client";

export type QuestionWithLinks = Question & { links: QuestionLink[] };
