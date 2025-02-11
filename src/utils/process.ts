/* eslint-disable @typescript-eslint/no-misused-promises */

import { PrismaClient } from '@prisma/client';

import { logger } from '../logger.js';
import { exitMessageFunctions, exitMessages } from '../translations/logs.js';

const shutdown = async (errorCode?: number) => {
  logger.info(exitMessages.shutdownGracefully);

  const prisma = new PrismaClient();
  try {
    await prisma.$disconnect();
    logger.info(exitMessages.databaseConnectionClosed);
  } catch (error) {
    logger.error(exitMessageFunctions.databaseConnectionError(error));
  }

  // eslint-disable-next-line n/no-process-exit
  process.exit(errorCode ?? 0);
};

export const attachProcessListeners = () => {
  process.on('SIGINT', shutdown);

  process.on('SIGTERM', shutdown);

  process.on('uncaughtException', (error, origin) => {
    logger.error(exitMessageFunctions.uncaughtException(error));
    logger.error(origin);
    void shutdown(1);
  });

  process.on('unhandledRejection', (error, promise) => {
    logger.error(exitMessageFunctions.unhandledRejection(error));
    logger.error(promise);
    void shutdown(1);
  });

  process.on('warning', (warning) => {
    logger.warn(warning);
  });

  process.on('beforeExit', async () => {
    logger.info(exitMessages.beforeExit);
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });

  process.on('exit', () => {
    logger.info(exitMessages.goodbye);
  });
};
