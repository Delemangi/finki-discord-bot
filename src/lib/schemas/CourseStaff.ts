import { z } from 'zod';

export const CourseStaffSchema = z
  .object({
    assistants: z.string(),
    course: z.string(),
    professors: z.string(),
  })
  .strict();

export type CourseStaff = z.infer<typeof CourseStaffSchema>;
