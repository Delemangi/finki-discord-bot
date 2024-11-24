import { z } from 'zod';

export const ClassroomSchema = z
  .object({
    capacity: z.union([z.number(), z.string()]),
    classroom: z.union([z.number(), z.string()]),
    description: z.string(),
    floor: z.union([z.number(), z.string()]),
    location: z.string(),
    type: z.string(),
  })
  .strict();

export type Classroom = z.infer<typeof ClassroomSchema>;
