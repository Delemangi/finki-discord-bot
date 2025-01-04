import { z } from 'zod';

export const StaffSchema = z
  .object({
    cabinet: z.union([z.number(), z.string()]),
    courses: z.string(),
    email: z.string(),
    finki: z.string(),
    name: z.string(),
    position: z.string(),
    raspored: z.string(),
    title: z.string(),
  })
  .strict();

export type Staff = z.infer<typeof StaffSchema>;
