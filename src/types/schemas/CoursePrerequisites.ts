import { z } from 'zod';

export const CoursePrerequisitesSchema = z
  .object({
    code: z.string(),
    course: z.string(),
    prerequisite: z.string(),
    semester: z.union([z.number(), z.string()]),
  })
  .strict();

export type CoursePrerequisites = z.infer<typeof CoursePrerequisitesSchema>;
