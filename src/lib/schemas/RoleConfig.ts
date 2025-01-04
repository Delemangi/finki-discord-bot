import { z } from 'zod';

export const RoleConfigSchema = z
  .object({
    color: z.array(z.string()),
    course: z.record(z.array(z.string())),
    courses: z.record(z.string()),
    level: z.array(z.string()),
    notification: z.array(z.string()),
    other: z.array(z.string()),
    program: z.array(z.string()),
    year: z.array(z.string()),
  })
  .strict();

export type RoleConfig = z.infer<typeof RoleConfigSchema>;
