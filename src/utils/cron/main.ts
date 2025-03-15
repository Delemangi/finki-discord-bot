import { Cron } from 'croner';

import {
  getIntervalsProperty,
  getTemporaryChannelsProperty,
} from '../../configuration/main.js';
import { TemporaryChannel } from '../../lib/schemas/Channel.js';
import { logger } from '../../logger.js';
import { labels } from '../../translations/labels.js';
import { logMessageFunctions } from '../../translations/logs.js';
import {
  recreateRegularsTemporaryChannel,
  recreateVipTemporaryChannel,
} from '../channels.js';
import { sendReminders } from '../reminders.js';
import { closeInactiveTickets } from '../tickets.js';

const getCronJobForEveryNSeconds = (n: number) => `*/${n} * * * * *`;

export const initializeCronJobs = () => {
  const cronJobs = [];

  const sendRemindersInterval = getIntervalsProperty('sendReminders') / 1_000;
  const ticketsCheckInterval = getIntervalsProperty('ticketsCheck') / 1_000;

  const vipTemporaryChannel = getTemporaryChannelsProperty(
    TemporaryChannel.VIP,
  );
  const regularsTemporaryChannel = getTemporaryChannelsProperty(
    TemporaryChannel.Regulars,
  );

  cronJobs.push(
    new Cron(
      getCronJobForEveryNSeconds(sendRemindersInterval),
      { name: 'sendReminders' },
      sendReminders,
    ),
    new Cron(
      getCronJobForEveryNSeconds(ticketsCheckInterval),
      { name: 'closeInactiveTickets' },
      closeInactiveTickets,
    ),
  );

  if (vipTemporaryChannel !== undefined) {
    cronJobs.push(
      new Cron(
        vipTemporaryChannel.cron,
        { name: 'recreateVipTemporaryChannel' },
        recreateVipTemporaryChannel,
      ),
    );
  }

  if (regularsTemporaryChannel !== undefined) {
    cronJobs.push(
      new Cron(
        regularsTemporaryChannel.cron,
        { name: 'recreateRegularsTemporaryChannel' },
        recreateRegularsTemporaryChannel,
      ),
    );
  }

  for (const job of cronJobs) {
    logger.info(logMessageFunctions.cronJobStarted(job.name ?? labels.unknown));
  }
};
