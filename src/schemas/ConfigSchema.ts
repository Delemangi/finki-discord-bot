import { z } from 'zod';

export const ConfigSchema = z
  .object({
    buttonIdleTime: z.number(),
    channels: z
      .object({
        activity: z.string().nullable(),
        commands: z.string().nullable(),
        oath: z.string().nullable(),
        polls: z.string().nullable(),
        vip: z.string().nullable(),
      })
      .strict(),
    color: z.string(),
    crosspostChannels: z.array(z.string()),
    crossposting: z.boolean(),
    ephemeralReplyTime: z.number(),
    guild: z.string(),
    leveling: z.boolean(),
    onions: z
      .object({
        mode: z.enum(['add', 'none', 'remove']),
        users: z.array(z.string()),
      })
      .strict(),
    roles: z
      .object({
        admin: z.string().nullable(),
        booster: z.string().nullable(),
        contributor: z.string().nullable(),
        council: z.string().nullable(),
        fss: z.string().nullable(),
        moderator: z.string().nullable(),
        ombudsman: z.string().nullable(),
        regular: z.string().nullable(),
        veteran: z.string().nullable(),
        vip: z.string().nullable(),
      })
      .strict(),
    temporaryRegularsChannel: z
      .object({
        cron: z.string(),
        name: z.string(),
        parent: z.string(),
        position: z.number(),
      })
      .strict(),
    temporaryVIPChannel: z
      .object({
        cron: z.string(),
        name: z.string(),
        parent: z.string(),
        position: z.number(),
      })
      .strict(),
    vipPause: z.boolean(),
  })
  .strict();
