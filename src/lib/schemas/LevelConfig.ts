import { z } from 'zod';

export const LevelConfigSchema = z.record(
  z
    .object({
      add: z.array(z.string()),
      remove: z.array(z.string()),
    })
    .strict(),
);

export type LevelConfig = z.infer<typeof LevelConfigSchema>;
