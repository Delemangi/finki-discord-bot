import { PollType } from '../lib/schemas/PollType.js';

export const POLL_TYPE_LABELS: Record<PollType, string> = {
  [PollType.ADMIN_ADD]: 'ADMIN ADD',
  [PollType.ADMIN_REMOVE]: 'ADMIN REMOVE',
  [PollType.BAR]: 'BAR',
  [PollType.COUNCIL_ADD]: 'COUNCIL ADD',
  [PollType.COUNCIL_REMOVE]: 'COUNCIL REMOVE',
  [PollType.IRREGULARS_ADD]: 'IRREGULARS ADD',
  [PollType.IRREGULARS_REMOVE]: 'IRREGULARS REMOVE',
  [PollType.IRREGULARS_REQUEST]: 'IRREGULARS REQUEST',
  [PollType.UNBAR]: 'UNBAR',
  [PollType.VIP_ADD]: 'VIP ADD',
  [PollType.VIP_REMOVE]: 'VIP REMOVE',
  [PollType.VIP_REQUEST]: 'VIP REQUEST',
};
