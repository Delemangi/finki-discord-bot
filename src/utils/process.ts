/* eslint-disable @typescript-eslint/no-misused-promises */

import { PrismaClient } from '@prisma/client';

import { Channel } from '../lib/schemas/Channel.js';
import { logger } from '../logger.js';
import { labels } from '../translations/labels.js';
import { exitMessageFunctions, exitMessages } from '../translations/logs.js';
import { getChannel } from './channels.js';

const shutdown = async (errorCode?: number, thrownError?: Error) => {
  logger.info(exitMessages.shutdownGracefully);

  const prisma = new PrismaClient();
  try {
    await prisma.$disconnect();
    logger.info(exitMessages.databaseConnectionClosed);
  } catch (error) {
    logger.error(exitMessageFunctions.databaseConnectionError(error));
  }

  const logsChannel = getChannel(Channel.Logs);
  try {
    await (errorCode
      ? logsChannel?.send(
          exitMessageFunctions.shutdownWithError(
            thrownError?.message ?? labels.unknown,
          ),
        )
      : logsChannel?.send(exitMessages.shutdownGracefully));
  } catch {
    // Do nothing
  }

  // eslint-disable-next-line n/no-process-exit
  process.exit(errorCode ?? 0);
};

export const attachProcessListeners = () => {
  process.on('SIGINT', shutdown);

  process.on('SIGTERM', shutdown);

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
