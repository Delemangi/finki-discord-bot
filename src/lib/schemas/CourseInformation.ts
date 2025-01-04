import { z } from 'zod';

export const CourseInformationSchema = z
  .object({
    code: z.string(),
    course: z.string(),
    level: z.union([z.number(), z.string()]),
    link: z.string(),
  })
  .strict();

export type CourseInformation = z.infer<typeof CourseInformationSchema>;
