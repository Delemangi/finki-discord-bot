/* eslint-disable camelcase */

import { z } from 'zod';

export const LinkSchema = z
  .object({
    created_at: z.string(),
    description: z.string().nullable(),
    id: z.string(),
    name: z.string(),
    updated_at: z.string(),
    url: z.string(),
    user_id: z.string().nullable(),
  })
  .transform((data) => ({
    createdAt: new Date(data.created_at),
    description: data.description,
    id: data.id,
    name: data.name,
    updatedAt: new Date(data.updated_at),
    url: data.url,
    userId: data.user_id,
  }));

export const LinksSchema = z.array(LinkSchema);

export type Link = z.infer<typeof LinkSchema>;

export const CreateLinkSchema = z
  .object({
    description: z.string().optional(),
    name: z.string(),
    url: z.string(),
    userId: z.string().optional(),
  })
  .transform((data) => ({
    description: data.description,
    name: data.name,
    url: data.url,
    user_id: data.userId,
  }));

export type CreateLink = z.infer<typeof CreateLinkSchema>;

export const UpdateLinkSchema = z
  .object({
    description: z.string().optional(),
    name: z.string().optional(),
    url: z.string().optional(),
    userId: z.string().optional(),
  })
  .transform((data) => ({
    description: data.description,
    name: data.name,
    url: data.url,
    user_id: data.userId,
  }));

export type UpdateLink = z.infer<typeof UpdateLinkSchema>;
