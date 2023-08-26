import { z } from "zod";

export const ConfigSchema = z.object({
  buttonIdleTime: z.number(),
  channels: z.object({
    activity: z.string().nullable(),
    commands: z.string().nullable(),
    oath: z.string().nullable(),
    polls: z.string().nullable(),
    vip: z.string().nullable(),
  }),
  color: z.string(),
  crosspostChannels: z.array(z.string()),
  crossposting: z.boolean(),
  ephemeralReplyTime: z.number(),
  guild: z.string(),
  leveling: z.boolean(),
  logo: z.string(),
  roles: z.object({
    admin: z.string().nullable(),
    booster: z.string().nullable(),
    contributor: z.string().nullable(),
    fss: z.string().nullable(),
    ombudsman: z.string().nullable(),
    vip: z.string().nullable(),
    vipInvited: z.string().nullable(),
    vipVoting: z.string().nullable(),
  }),
  temporaryVIPChannel: z.object({
    cron: z.string(),
    name: z.string(),
    parent: z.string(),
    position: z.number(),
  }),
});
