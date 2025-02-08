import { z } from 'zod';

export enum PollType {
  ADMIN_ADD = 'adminAdd',
  ADMIN_REMOVE = 'adminRemove',
  BAR = 'bar',
  COUNCIL_ADD = 'councilAdd',
  COUNCIL_REMOVE = 'councilRemove',
  IRREGULARS_ADD = 'irregularsAdd',
  IRREGULARS_REMOVE = 'irregularsRemove',
  IRREGULARS_REQUEST = 'irregularsRequest',
  UNBAR = 'unbar',
  VIP_ADD = 'vipAdd',
  VIP_REMOVE = 'vipRemove',
  VIP_REQUEST = 'vipRequest',
}

export const PollTypeSchema = z.nativeEnum(PollType);
