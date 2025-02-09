/* eslint-disable n/prefer-global/process */

import { env } from 'node:process';
import { z } from 'zod';

import { configErrors } from '../translations/errors.js';

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
