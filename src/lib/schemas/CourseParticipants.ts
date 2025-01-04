import { z } from 'zod';

export const CourseParticipantsSchema = z
  .object({
    course: z.string(),
  })
  .strict()
  .catchall(z.number());

export type CourseParticipants = z.infer<typeof CourseParticipantsSchema>;
