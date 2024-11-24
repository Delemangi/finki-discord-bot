import { ChannelSchema, TemporaryChannelSchema } from './Channel.js';
import { RoleSchema } from './Role.js';
import { TicketSchema } from './Ticket.js';
import { z } from 'zod';

const TemporaryChannelConfigSchema = z
  .object({
    cron: z.string(),
    name: z.string(),
    parent: z.string().optional(),
  })
  .strict();

export const RequiredBotConfigSchema = z
  .object({
    channels: z.record(ChannelSchema, z.string().optional()).optional(),
    crossposting: z
      .object({
        channels: z.array(z.string()).optional(),
        enabled: z.boolean().optional(),
      })
      .strict()
      .optional(),
    experience: z
      .object({
        enabled: z.boolean().optional(),
        multipliers: z.record(z.number()).optional(),
      })
      .strict()
      .optional(),
    guild: z.string().optional(),
    intervals: z
      .object({
        buttonIdle: z.number().optional(),
        ephemeralReply: z.number().optional(),
        ticketsCheck: z.number().optional(),
      })
      .strict()
      .optional(),
    oathEnabled: z.boolean().optional(),
    reactions: z
      .object({
        add: z.record(z.string()).optional(),
        remove: z.record(z.string()).optional(),
      })
      .strict()
      .optional(),
    roles: z.record(RoleSchema, z.string()).optional(),
    temporaryChannels: z
      .record(TemporaryChannelSchema, TemporaryChannelConfigSchema)
      .optional(),
    themeColor: z.string().optional(),
    ticketing: z
      .object({
        allowedInactivityDays: z.number().optional(),
        enabled: z.boolean().optional(),
        tickets: z.array(TicketSchema).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const BotConfigSchema = RequiredBotConfigSchema.optional();
export type BotConfig = z.infer<typeof BotConfigSchema>;

export const BotConfigKeysSchema = RequiredBotConfigSchema.keyof();
export type BotConfigKeys = keyof NonNullable<BotConfig>;

export const FullyRequiredBotConfigSchema = RequiredBotConfigSchema.required();
export type FullyRequiredBotConfig = z.infer<
  typeof FullyRequiredBotConfigSchema
>;