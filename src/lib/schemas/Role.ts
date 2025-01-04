import { z } from 'zod';

export enum Role {
  Administration = 'administration',
  Administrators = 'administrators',
  Boosters = 'boosters',
  Boys = 'boys',
  Contributors = 'contributors',
  Council = 'council',
  FSS = 'fss',
  Girlies = 'girlies',
  Irregulars = 'irregulars',
  Moderators = 'moderators',
  Ombudsman = 'ombudsman',
  Regulars = 'regulars',
  Veterans = 'veterans',
  VIP = 'vip',
}

export const RoleSchema = z.nativeEnum(Role);
