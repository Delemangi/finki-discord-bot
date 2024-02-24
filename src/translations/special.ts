import { type PartialUser } from '../types/PartialUser.js';
import { tagAndMentionUser } from './users.js';
import { userMention } from 'discord.js';

export const specialStrings = {
  vipAcceptButton: 'Прифаќам',
  vipAcceptedTitle: 'Заклетва',
  vipConfirm:
    'Изјавувам дека функцијата „член на ВИП во официјалниот Дискорд сервер на студентите на ФИНКИ“ ќе ја вршам совесно и одговорно и ќе го почитувам Уставот, законите на Република Северна Македонија и правилата на официјалниот Discord сервер на студентите на ФИНКИ.',
  vipRejected: 'Вашата молба беше одбиена.',
  vipRequestActive: 'Вашата молба е активна.',
  vipRequestButton: 'Да',
  vipRequestFailed: 'Настана грешка при испраќање на вашата молба.',
  vipRequestPaused: 'Молбите за влез во ВИП се моментално ставени во мирување.',
  vipRequestSent: 'Вашата молба е испратена. Ќе бидете известени за одлуката.',
  vipRequestText:
    'Дали сакате да станете член на ВИП во серверот на студентите на ФИНКИ?',
  vipRequestTitle: 'Членство во ВИП',
  vipRequestUnderLevel: 'Не го исполнувате условот за ниво за аплицирање.',
};

export const specialStringFunctions = {
  adminAddAccepted: (userId: string) =>
    `# Корисникот ${userMention(
      userId,
    )} е одобрен како член на Администрацијата.`,

  adminAddDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да стане член на Администрацијата?`,

  adminAddRejected: (userId: string) =>
    `# Корисникот ${userMention(
      userId,
    )} не е одобрен како член на Администрацијата.`,

  adminAddTitle: (userTag: string) => `Влез во Администрација за ${userTag}`,

  adminRemoveAccepted: (userId: string) =>
    `# Корисникот ${userMention(userId)} е избркан од Администрацијата.`,

  adminRemoveDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да биде избркан од Администрацијата?`,

  adminRemoveRejected: (userId: string) =>
    `# Корисникот ${userMention(userId)} не е избркан од Администрацијата.`,

  adminRemoveTitle: (userTag: string) =>
    `Излез од Администрација за ${userTag}`,

  barAccepted: (userId: string) =>
    `# Корисникот ${userMention(userId)} е забранет.`,

  barDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да добие забрана?`,

  barRejected: (userId: string) =>
    `# Корисникот ${userMention(userId)} не е забранет.`,

  barTitle: (userTag: string) => `Забрана за ${userTag}`,

  councilAddAccepted: (userId: string) =>
    `# Корисникот ${userMention(userId)} е одобрен како член на Советот.`,

  councilAddDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да стане член на Советот?`,

  councilAddRejected: (userId: string) =>
    `# Корисникот ${userMention(userId)} не е одобрен како член на Советот.`,

  councilAddTitle: (userTag: string) => `Влез во Советот за ${userTag}`,

  councilRemoveAccepted: (userId: string) =>
    `# Корисникот ${userMention(userId)} е избркан од Советот.`,

  councilRemoveDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да биде избркан од Советот?`,

  councilRemoveRejected: (userId: string) =>
    `# Корисникот ${userMention(userId)} не е избркан од Советот.`,

  councilRemoveTitle: (userTag: string) => `Излез од Советот за ${userTag}`,

  tempRegularsTopic: (date: string) =>
    `Задните соби на редовните. Содржината се брише секој ден. Следно бришење е во ${date}.`,

  tempVipTopic: (date: string) =>
    `Задните соби на ВИП. Содржината се брише секој ден. Следно бришење е во ${date}.`,

  unbarAccepted: (userId: string) =>
    `# Забраната за корисникот ${userMention(userId)} е укината.`,

  unbarDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате забраната за корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да биде укината?`,

  unbarRejected: (userId: string) =>
    `# Забраната за корисникот ${userMention(userId)} не е укината.`,

  unbarTitle: (userTag: string) => `Укинување забрана за ${userTag}`,

  vipAddAccepted: (userId: string) =>
    `# Корисникот ${userMention(userId)} е одобрен како член на ВИП.`,

  vipAddDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да стане член на ВИП?`,

  vipAddRejected: (userId: string) =>
    `# Корисникот ${userMention(userId)} не е одобрен како член на ВИП.`,

  vipAddRequestAccepted: (userId: string) =>
    `# ${userMention(userId)} Советот донесе одлука да Ве покани во ВИП.`,

  vipAddTitle: (userTag: string) => `Влез во ВИП за ${userTag}`,

  vipRemoveAccepted: (userId: string) =>
    `# Корисникот ${userMention(userId)} е избркан од ВИП.`,

  vipRemoveDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да биде избркан од ВИП?`,

  vipRemoveRejected: (userId: string) =>
    `# Корисникот ${userMention(userId)} не е избркан од ВИП.`,

  vipRemoveTitle: (userTag: string) => `Излез од ВИП за ${userTag}`,

  vipRequestAccepted: (userId: string) =>
    `# ${userMention(userId)} Вашата молба за влез во ВИП беше одобрена.`,

  vipRequestRejected: (userId: string) =>
    `# ${userMention(userId)} Вашата молба за влез во ВИП не беше одобрена.`,

  vipWelcome: (userId: string) =>
    `# Добредојде во ВИП, ${userMention(userId)}!`,
};
