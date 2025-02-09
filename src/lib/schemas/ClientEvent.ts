import { z } from 'zod';

const AwaitableVoid = z.union([z.void(), z.promise(z.void())]);

export const ClientEventSchema = z.object({
  execute: z.function().args(z.array(z.unknown())).returns(AwaitableVoid),
  name: z.string(),
  once: z.boolean().optional(),
});
