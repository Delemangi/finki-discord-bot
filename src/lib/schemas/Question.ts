/* eslint-disable camelcase */

import { z } from 'zod';

export const QuestionSchema = z
  .object({
    content: z.string(),
    created_at: z.string(),
    id: z.string(),
    links: z.record(z.string()).optional(),
    name: z.string(),
    updated_at: z.string(),
    user_id: z.string().optional(),
  })
  .transform((data) => ({
    content: data.content,
    createdAt: new Date(data.created_at),
    id: data.id,
    links: data.links,
    name: data.name,
    updatedAt: new Date(data.updated_at),
    userId: data.user_id,
  }));

export const QuestionsSchema = z.array(QuestionSchema);

export type Question = z.infer<typeof QuestionSchema>;

export const CreateQuestionSchema = z
  .object({
    content: z.string(),
    links: z.record(z.string()).optional(),
    name: z.string(),
    userId: z.string().optional(),
  })
  .transform((data) => ({
    content: data.content,
    links: data.links,
    name: data.name,
    user_id: data.userId,
  }));

export type CreateQuestion = z.infer<typeof CreateQuestionSchema>;

export const UpdateQuestionSchema = z
  .object({
    content: z.string().optional(),
    links: z.record(z.string()).optional(),
    name: z.string().optional(),
    userId: z.string().optional(),
  })
  .transform((data) => ({
    content: data.content,
    links: data.links,
    name: data.name,
    user_id: data.userId,
  }));

export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>;
