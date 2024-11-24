import { z } from 'zod';

export const TicketSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    roles: z.array(z.string()),
  })
  .strict();

export type Ticket = z.infer<typeof TicketSchema>;
