import { type PartialUser } from "../types/PartialUser.js";
import { tagAndMentionUser } from "./users.js";
import { userMention } from "discord.js";

export const vipStrings = {
  vipAcceptButton: "Прифаќам",
  vipAcceptedTitle: "Заклетва",
  vipBanned: "Вашата молба беше одбиена.",
  vipConfirm:
    "Изјавувам дека функцијата „член на ВИП во официјалниот Дискорд сервер на студентите на ФИНКИ“ ќе ја вршам совесно и одговорно и ќе го почитувам Уставот, законите на Република Северна Македонија и правилата на официјалниот Discord сервер на студентите на ФИНКИ.",
  vipRequestActive: "Вашата молба е активна.",
  vipRequestButton: "Да",
  vipRequestFailed: "Настана грешка при испраќање на вашата молба.",
  vipRequestPaused: "Молбите за влез во ВИП се моментално ставени во мирување.",
  vipRequestSent: "Вашата молба е испратена. Ќе бидете известени за одлуката.",
  vipRequestText:
    "Дали сакате да станете член на ВИП во серверот на студентите на ФИНКИ?",
  vipRequestTitle: "Членство во ВИП",
};

export const vipStringFunctions = {
  tempVipTopic: (date: string) =>
    `Задните соби на ВИП. Содржината се брише секој ден. Следно бришење е во ${date}.`,

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

  vipBanAccepted: (userId: string) =>
    `# Корисникот ${userMention(userId)} е забранет во ВИП.`,

  vipBanDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да добие забрана за членство во ВИП?`,

  vipBanRejected: (userId: string) =>
    `# Корисникот ${userMention(userId)} не е забранет во ВИП.`,

  vipBanTitle: (userTag: string) => `Забрана во ВИП за ${userTag}`,

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

  vipUnbanAccepted: (userId: string) =>
    `# Забраната во ВИП за корисникот ${userMention(userId)} е укината.`,

  vipUnbanDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате забраната во ВИП за корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да биде укината?`,

  vipUnbanRejected: (userId: string) =>
    `# Забраната во ВИП за корисникот ${userMention(userId)} не е укината.`,

  vipUnbanTitle: (userTag: string) => `Укинување забрана во ВИП за ${userTag}`,

  vipUpgradeAccepted: (userId: string) =>
    `# Корисникот ${userMention(
      userId,
    )} е одобрен како полноправен член на ВИП.`,

  vipUpgradeDescription: ({ tag, id }: PartialUser) =>
    `Дали се согласувате корисникот ${tagAndMentionUser({
      id,
      tag,
    })} да добие гласачки права во ВИП?`,

  vipUpgradeRejected: (userId: string) =>
    `# Корисникот ${userMention(
      userId,
    )} не е одобрен како полноправен член на ВИП.`,

  vipUpgradeTitle: (userTag: string) => `Гласачки права во ВИП за ${userTag}`,

  vipWelcome: (userId: string) =>
    `# Добредојде во ВИП, ${userMention(userId)}!`,
};
