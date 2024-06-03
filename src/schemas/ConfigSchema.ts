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
        tickets: z.string().nullable(),
        vip: z.string().nullable(),
      })
      .strict(),
    color: z.string(),
    crosspostChannels: z.array(z.string()),
    crossposting: z.boolean(),
    ephemeralReplyTime: z.number(),
    experienceMultipliers: z.record(z.number()),
    guild: z.string(),
    leveling: z.boolean(),
    reactions: z
      .object({
        add: z.record(z.string()),
        remove: z.record(z.string()),
      })
      .strict(),
    roles: z
      .object({
        admin: z.string().nullable(),
        admins: z.string().nullable(),
        booster: z.string().nullable(),
        boys: z.string().nullable(),
        contributor: z.string().nullable(),
        council: z.string().nullable(),
        fss: z.string().nullable(),
        girlies: z.string().nullable(),
        moderator: z.string().nullable(),
        ombudsman: z.string().nullable(),
        regular: z.string().nullable(),
        veteran: z.string().nullable(),
        vip: z.string().nullable(),
      })
      .strict(),
    starboard: z.string().optional(),
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
    tickets: z.array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          roles: z.array(z.string()),
        })
        .strict(),
    ),
    vipPause: z.boolean(),
  })
  .strict();
