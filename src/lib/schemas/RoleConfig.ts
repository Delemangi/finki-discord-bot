import { z } from 'zod';

export const RoleConfigSchema = z
  .object({
    color: z.array(z.string()).optional(),
    course: z.record(z.array(z.string())).optional(),
    courses: z.record(z.string()).optional(),
    level: z.array(z.string()).optional(),
    notification: z.array(z.string()).optional(),
    other: z.array(z.string()).optional(),
    program: z.array(z.string()).optional(),
    year: z.array(z.string()).optional(),
  })
  .strict();

export type RoleConfig = z.infer<typeof RoleConfigSchema>;
