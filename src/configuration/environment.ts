import { configErrors } from '../translations/errors.js';
import { env } from 'node:process';
import { z } from 'zod';

export const getToken = () => {
  try {
    return z.string().parse(env['TOKEN']);
  } catch {
    throw new Error(configErrors.noToken);
  }
};

export const getApplicationId = () => {
  try {
    return z.string().parse(env['APPLICATION_ID']);
  } catch {
    throw new Error(configErrors.noApplicationId);
  }
};
