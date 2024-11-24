import { z } from 'zod';

export const CompaniesSchema = z.array(z.string());
