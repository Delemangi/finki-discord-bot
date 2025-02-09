import { z } from 'zod';

export const StringToObjectSchema = z.string().transform((str, ctx) => {
  try {
    const parsed: unknown = JSON.parse(str);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JSON object',
      });
      return z.NEVER;
    }

    return parsed;
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid JSON string',
    });

    return z.NEVER;
  }
});
