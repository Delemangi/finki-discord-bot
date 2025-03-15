import { Cron } from 'croner';

import {
  getConfigProperty,
  getIntervalsProperty,
  getTemporaryChannelsProperty,
} from '../../configuration/main.js';
import { TemporaryChannel } from '../../lib/schemas/Channel.js';
import { logger } from '../../logger.js';
import { labels } from '../../translations/labels.js';
import { logMessageFunctions } from '../../translations/logs.js';
import { createSendAdsJob } from '../ads.js';
import {
  recreateRegularsTemporaryChannel,
  recreateVipTemporaryChannel,
} from '../channels.js';
import { sendReminders } from '../reminders.js';
import { closeInactiveTickets } from '../tickets.js';
import { DATE_FORMATTER } from './constants.js';

const convertMillisecondsToCronJob = (ms: number) => {
  // check if the interval is less than a minute
  if (ms < 60_000) {
    return `*/${ms / 1_000} * * * * *`;
  }

  // check if the interval is less than an hour
  if (ms < 3_600_000) {
    return `*/${ms / 60_000} * * * *`;
  }

  // check if the interval is less than a day
  if (ms < 86_400_000) {
    return `0 */${ms / 3_600_000} * * *`;
  }

  // check if the interval is less than a month
  if (ms < 2_592_000_000) {
    return `0 0 */${ms / 86_400_000} * *`;
  }

  // check if the interval is less than a year
  if (ms < 31_536_000_000) {
    return `0 0 0 */${ms / 2_592_000_000} *`;
  }

  return '0 0 0 0 0';
};

export const initializeCronJobs = () => {
  const cronJobs: Cron[] = [];

  const sendRemindersInterval = getIntervalsProperty('sendReminders');
  const ticketsCheckInterval = getIntervalsProperty('ticketsCheck');

  const vipTemporaryChannel = getTemporaryChannelsProperty(
    TemporaryChannel.VIP,
  );
  const regularsTemporaryChannel = getTemporaryChannelsProperty(
    TemporaryChannel.Regulars,
  );

  const ads = getConfigProperty('ads');

  cronJobs.push(
    new Cron(
      convertMillisecondsToCronJob(sendRemindersInterval),
      { name: 'sendReminders' },
      sendReminders,
    ),
    new Cron(
      convertMillisecondsToCronJob(ticketsCheckInterval),
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

  for (const ad of ads ?? []) {
    cronJobs.push(
      new Cron(ad.cron, { name: `sendAd-${ad.name}` }, createSendAdsJob(ad)),
    );
  }

  for (const job of cronJobs) {
    const nextRunDate = job.nextRun();
    const nextRun =
      nextRunDate === null
        ? labels.unknown
        : DATE_FORMATTER.format(nextRunDate);

    logger.info(
      logMessageFunctions.cronJobInitialized(
        job.name ?? labels.unknown,
        nextRun,
      ),
    );
  }
};
