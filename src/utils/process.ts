/* eslint-disable @typescript-eslint/no-misused-promises */

import { PrismaClient } from '@prisma/client';

import { logger } from '../logger.js';
import { exitMessageFunctions, exitMessages } from '../translations/logs.js';

const shutdownGracefully = async () => {
  logger.info(exitMessages.shutdownGracefully);

  const prisma = new PrismaClient();
  try {
    await prisma.$disconnect();
    logger.info(exitMessages.databaseConnectionClosed);
  } catch (error) {
    logger.error(exitMessageFunctions.databaseConnectionError(error));
  }

  // eslint-disable-next-line n/no-process-exit
  process.exit(0);
};

export const attachProcessListeners = () => {
  process.on('SIGINT', shutdownGracefully);

  process.on('SIGTERM', shutdownGracefully);

  process.on('beforeExit', async () => {
    logger.info(exitMessages.beforeExit);
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });

  process.on('exit', () => {
    logger.info(exitMessages.goodbye);
  });
};
