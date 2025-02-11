import { labels } from '../../translations/labels.js';

export const POLL_TYPES = [
  'vipRequest',
  'vipAdd',
  'vipRemove',
  'councilAdd',
  'councilRemove',
  'adminAdd',
  'adminRemove',
  'bar',
  'unbar',
  'irregularsRequest',
  'irregularsAdd',
  'irregularsRemove',
] as const;

export const POLL_OPTIONS = [labels.yes, labels.no, labels.abstain] as const;
