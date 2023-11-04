/* eslint-disable id-length */

import { type PartialUser } from "../types/PartialUser.js";
import { type ProgramName } from "../types/ProgramName.js";
import { type ProgramShorthand } from "../types/ProgramShorthand.js";
import {
  bold,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  codeBlock,
  hyperlink,
  inlineCode,
  roleMention,
  type UserContextMenuCommandInteraction,
  userMention,
} from "discord.js";

// Commands

export const commandDescriptions = {
  about: "За Discord ботот",
  anto: "Превземи Анто факт",
  classroom: "Превземи информации за просторија",
  "config get": "Превземи конфигурација",
  "config set": "Измени конфигурација",
  "course info": "Превземи информации за предмет",
  "course participants": "Превземи број на слушатели на предмет",
  "course prerequisite": "Превземи предуслов за предмет",
  "course professors": "Превземи наставен кадар на предмет",
  "course role": "Превземи број на корисници во канал на предмет",
  "course summary": "Превземи информации за предмет",
  "course toggle": "Земи или отстрани улога за предмет",
  "courses add": "Земи улоги за многу предмети",
  "courses prerequisite": "Превземи предмети според предуслов",
  "courses program": "Превземи предмети според смер",
  "courses remove": "Отстрани улоги за многу предмети",
  embed: "Креирај ембед",
  "experience add": "Додади поени за активност",
  "experience get": "Превземи ниво и активност",
  "experience leaderboard": "Превземи листа на членови според активност",
  faq: "Превземи најчесто поставувано прашање",
  help: "Превземи листа од сите достапни команди",
  home: "Превземи линк до изворниот код",
  invite: "Превземи пристапен линк за серверот",
  link: "Превземи најчесто баран линк",
  "list links": "Превземи листа од сите линкови",
  "list questions": "Превземи листа од сите прашања",
  "manage anto-add": "Додади Анто факт",
  "manage anto-delete": "Избриши Анто факт",
  "manage anto-mass-add": "Додади многу Анто факти",
  "manage company-delete": "Избриши компанија",
  "manage company-mass-add": "Додади многу компании",
  "manage company-set": "Додади или измени компанија",
  "manage infomessage-delete": "Избриши информативна порака",
  "manage infomessage-set": "Додади или измени информативна порака",
  "manage link-content": "Прикажи содржина на линк",
  "manage link-delete": "Избриши линк",
  "manage link-set": "Додади или измени линк",
  "manage question-content": "Прикажи содржина на прашање",
  "manage question-delete": "Избриши прашање",
  "manage question-set": "Додади или измени прашање",
  "manage rule-delete": "Избриши правило",
  "manage rule-set": "Додади или измени правило",
  members: "Прикажи број на членови на серверот",
  message: "Испрати порака",
  ping: "Прикажи време на одзив",
  "poll add": "Додади опции на анкети",
  "poll close": "Затвори анкета за гласање",
  "poll create": "Креирај анкета",
  "poll delete": "Избриши анкета",
  "poll edit": "Измени наслов и опис на анкета",
  "poll info": "Информации за анкета",
  "poll list": "Превземи листа од сите анкети",
  "poll open": "Отвори анкета за гласање",
  "poll remove": "Избриши опции на анкета",
  "poll show": "Прикажи анкета",
  "poll stats": "Прикажи статистика за гласови",
  profile: "Превземи информации за студент",
  purge: "Бриши пораки",
  question: "Превземи најчесто поставувано прашање",
  register: "Регистрирај команди",
  reminder: "Креирај потсетник",
  rules: "Превземи правила на серверот",
  "script colors": "Испрати ембед за избирање бои",
  "script courses": "Испрати ембеди за избирање предмети",
  "script info": "Испрати ги сите информации за серверот",
  "script notifications": "Испрати ембед за избирање нотификации",
  "script programs": "Испрати ембед за избирање смерови",
  "script register": "Регистрирај команди",
  "script rules": "Испрати ги правилата на серверот",
  "script vip": "Испрати ембед за ВИП",
  "script years": "Испрати ембед за избирање години",
  session: "Превземи распоред за испитна сесија или колоквиумска недела",
  staff: "Превземи информации за професор",
  "statistics color": "Прикажи статистика за улогите за бои",
  "statistics course": "Прикажи статистика за улогите за предмети",
  "statistics notification": "Прикажи статистика за улогите за нотификации",
  "statistics program": "Прикажи статистика за улогите за програми",
  "statistics server": "Прикажи статистика за серверот",
  "statistics year": "Прикажи статистика за улогите за години",
  "vip add": "Предложи нов член за ВИП",
  "vip ban": "Предложи забрана на член во ВИП",
  "vip bans": "Прикажи забранети корисници во ВИП",
  "vip delete": "Избриши ВИП анкета",
  "vip invite": "Покани член во ВИП",
  "vip invited": "Прикажи ги сите членови кои се поканети во ВИП",
  "vip list": "Прикажи листа од сите ВИП анкети",
  "vip members": "Прикажи состав на ВИП",
  "vip override": "Одлучи ВИП анкета",
  "vip remaining": "Прикажи листа од членови кои не гласале",
  "vip remove": "Предложи бркање на член на ВИП",
  "vip unban": "Предложи укинување на забрана на корисник во ВИП",
  "vip upgrade": "Предложи унапредување на член на ВИП",
};

// User format

export const tagAndMentionUser = ({ tag, id }: PartialUser) =>
  `${tag} (${userMention(id)})`;

// VIP

export const vipStrings = {
  vipAcceptButton: "Прифаќам",
  vipAcceptedTitle: "Заклетва",
  vipBanned: "Вашата молба беше одбиена.",
  vipConfirm:
    "Изјавувам дека функцијата „член на ВИП во официјалниот Discord сервер на студентите на ФИНКИ“ ќе ја вршам совесно и одговорно и ќе го почитувам Уставот, законите на Република Северна Македонија и правилата на официјалниот Discord сервер на студентите на ФИНКИ.",
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
    `# ${userMention(userId)} Вашата молба за влез во ВИП беше одобрена.`,

  vipAddRequestRejected: (userId: string) =>
    `# ${userMention(userId)} Вашата молба за влез во ВИП не беше одобрена.`,

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

// About

export const botName = "ФИНКИ Discord Бот";

export const aboutString = (helpCommand: string, faqCommand: string) =>
  `Овој бот е развиен од ${userMention(
    "198249751001563136",
  )} за потребите на Discord серверот на студентите на ФИНКИ. Ботот е open source и може да се најде на ${hyperlink(
    "GitHub",
    "https://github.com/Delemangi/finki-discord-bot",
  )}. Ако имате било какви прашања, предлози или проблеми, контактирајте нè на Discord или на GitHub. \n\nНапишете ${helpCommand} за да ги видите сите достапни команди, или ${faqCommand} за да ги видите сите достапни прашања.`;

// Experience messages

export const experienceMessages = {
  levelUp: (userId: string, level: number | string) =>
    `Корисникот ${userMention(userId)} достигна ниво ${level}.`,
};

// Programs

export const programMapping: {
  [index in ProgramName]: ProgramShorthand;
} = {
  ИМБ: "imb",
  КЕ: "ke",
  КИ: "ki",
  КН: "kn",
  ПИТ: "pit",
  ПСП: "psp",
  СИИС: "siis",
};

// Command responses

export const commandResponses = {
  allCoursesAdded: "Ги земавте сите предмети.",
  allCoursesRemoved: "Ги отстранивте сите предмети.",
  antoDeleted: "Го избришавте Анто фактот.",
  antosCreated: "Креиравте Анто фактот.",
  commandsRegistered: "Ги регистриравте командите.",
  companiesCreated: "Креиравте компании.",
  companyCreated: "Креиравте компанија.",
  companyDeleted: "Ја избришавте компанијата.",
  embedCreated: "Креиравте ембед.",
  faqDeleted: "Го избришавте прашањето.",
  infoCreated: "Креиравте информативна порака.",
  infoDeleted: "Ја избришавте информативната порака.",
  linkDeleted: "Го избришавте линкот.",
  messageCreated: "Испративте порака.",
  noVipBanned: "Нема членови со забрана во ВИП.",
  noVoters: "Нема гласачи.",
  pollClosed: "Анкетата е затворена.",
  pollDeleted: "Анкетата е избришана.",
  pollOpen: "Анкетата е отворена за гласање.",
  pollOptionsAdded: "Опциите се додадени.",
  pollOptionsDeleted: "Опциите се избришани.",
  pollOverriden: "Анкетата е одлучена.",
  ruleCreated: "Креиравте правило.",
  ruleDeleted: "Го избришавте правилото.",
  scriptExecuted: "Ја извршивте скриптата.",
  userVipInvited: "Го поканивте корисникот во ВИП.",
  voteRemoved: "Го тргнавте гласот.",
};

export const commandResponseFunctions = {
  colorAddedOrRemoved: (roleId: string, added: boolean) =>
    `Ја ${added ? "земавте" : "отстранивте"} бојата ${roleMention(roleId)}.`,

  courseAdded: (roleId: string) =>
    `Го земавте предметот ${roleMention(roleId)}. ${bold(
      "НАПОМЕНА",
    )}: препорачано е да ги земате предметите од делот ${inlineCode(
      "Channels & Roles",
    )} најгоре во листата на каналите.`,

  courseAddedOrRemoved: (roleId: string, added: boolean) =>
    `Го ${added ? "земавте" : "отстранивте"} предметот ${roleMention(
      roleId,
    )}. ${bold(
      "НАПОМЕНА",
    )}: препорачано е да ги земате предметите од делот ${inlineCode(
      "Channels & Roles",
    )} најгоре во листата на каналите.`,

  courseRemoved: (roleId: string) =>
    `Го отстранивте предметот ${roleMention(roleId)}. ${bold(
      "НАПОМЕНА",
    )}: препорачано е да ги земате предметите од делот ${inlineCode(
      "Channels & Roles",
    )} најгоре во листата на каналите.`,

  deletingMessages: (count: number | string) => `Се бришат ${count} пораки...`,

  experienceAdded: (experience: number | string, userId: string) =>
    `Додадовте ${experience} поени за активност на корисникот ${userMention(
      userId,
    )}.`,

  multipleClassrooms: (classroom: string) =>
    `${bold(
      "НАПОМЕНА",
    )}: Просторијата ${classroom} постои на повеќе факултети.`,

  notificationAddedOrRemoved: (roleId: string, added: boolean) =>
    `${added ? "земавте" : "отстранивте"} нотификации за ${roleMention(
      roleId,
    )}.`,

  ping: (ping: number | string) => `${ping} ms`,

  pollEdited: (edits: string) => `Ја изменивте анкетата (${edits}).`,

  pollStats: (pollTitle: string) =>
    `Преглед на гласовите за анкетата ${inlineCode(pollTitle)}`,

  programAddedOrRemoved: (roleId: string, added: boolean) =>
    `Го ${added ? "земавте" : "отстранивте"} смерот ${roleMention(roleId)}.`,

  reminderCreated: (timestamp: string, message: string) =>
    `Креиравте потсетник во ${timestamp} за ${inlineCode(message)}.`,

  seePollChanges: (command: string) =>
    `Користете ${command} за да ги видите промените.`,

  semesterCoursesAdded: (semester: number | string) =>
    `Ги земавте предметите од семестар ${semester}.`,

  semesterCoursesRemoved: (semester: number | string) =>
    `Ги отстранивте предметите од семестар ${semester}.`,

  serverMembers: (memberCount: number | string | undefined) =>
    `Серверот има ${memberCount ?? "непознат број на"} членови.`,

  voteAdded: (option: string) => `Гласавте за ${inlineCode(option)}.`,

  yearAddedOrRemoved: (roleId: string, added: boolean) =>
    `Годината ${roleMention(roleId)} е ${added ? "земена" : "отстранета"}.`,
};

// Command errors

export const commandErrors = {
  alreadyVipMember: "Веќе сте член на ВИП.",
  antoCreationFailed: "Креирањето на Анто фактот беше неуспешно.",
  antoNotFound: "Анто фактот не постои.",
  antosCreationFailed: "Креирањето на Анто фактите беше неуспешно.",
  buttonNoPermission: "Командата не е ваша.",
  classroomNotFound: "Просторијата не постои.",
  commandError:
    "Настана грешка при извршување на командата. Обидете се повторно, или пријавете ја грешката.",
  commandNoPermission: "Немате дозвола да ја извршите командата.",
  commandNotFound: "Командата не постои.",
  commandsNotRegistered: "Регистрирањето на командите беше неуспешно.",
  companiesCreationFailed: "Креирањето на компаниите беше неуспешно.",
  companyCreationFailed: "Креирањето на компанијата беше неуспешно.",
  companyNotFound: "Компанијата не постои.",
  courseNotFound: "Предметот не постои.",
  dataFetchFailed: "Превземањето на податоците беше неуспешно.",
  embedSendError: "Креирањето на ембедот беше неуспешно.",
  faqCreationFailed: "Креирањето на прашањето беше неуспешно.",
  faqNotFound: "Прашањето не постои.",
  faqSendFailed: "Испраќањето на прашањето беше неуспешно.",
  infoNotFound: "Информативната порака не постои.",
  invalidAntos: "Анто фактите се во невалиден формат.",
  invalidChannel: "Каналот е невалиден.",
  invalidColor: "Бојата е невалидна.",
  invalidCompanies: "Компаниите се во невалиден формат.",
  invalidDateTime: "Датумот и/или времето се невалидни.",
  invalidLink: "Линкот е невалиден.",
  invalidLinks: "Линковите се во невалиден формат.",
  invalidRoles: "Улогите се невалидни.",
  inviteCreationFailed: "Креирањето на пристапен линк беше неуспешно.",
  linkCreationFailed: "Креирањето на линкот беше неуспешно.",
  linkNotFound: "Линкот не постои.",
  linkSendFailed: "Испраќањето на линкот беше неуспешно.",
  linksFetchFailed: "Превземањето на линковите беше неуспешно.",
  noAnto: "Анто фактите не се креирани.",
  oathNoPermission: "Заклетвата не е ваша.",
  optionNotFound: "Опцијата не постои.",
  pollAnonymous: "Анкетата е анонимна.",
  pollCreationFailed: "Креирањето на анкетата беше неуспешно.",
  pollDeletionFailed: "Бришењето на анкетата беше неуспешно.",
  pollNoOptions: "Анкетата нема опции.",
  pollNoPermission: "Анкетата не е ваша.",
  pollNotFound: "Анкетата не постои.",
  pollOrOptionNotFound: "Анкетата или опцијата не постои.",
  pollsFetchFailed: "Превземањето на анкетите беше неуспешно.",
  pollTooManyOptions: "Анкетата има премногу опции.",
  pollVotesFetchFailed: "Превземањето на гласовите беше неуспешно.",
  questionsFetchFailed: "Превземањето на прашањата беше неуспешно.",
  rulesFetchFailed: "Превземањето на правилата беше неуспешно.",
  scriptNotExecuted: "Скриптата не е извршена.",
  serverOnlyCommand: "Командата се повикува само во серверот.",
  sessionNotFound: "Сесијата не постои.",
  staffNotFound: "Професорот не постои.",
  userAdmin: "Корисникот е администратор.",
  userBot: "Корисникот е бот.",
  userFullVipMember: "Корисникот е полноправен член на ВИП.",
  userNotFound: "Корисникот не постои.",
  userNotMember: "Корисникот не е член на серверот.",
  userNotVipBanned: "Корисникот не е баниран од ВИП.",
  userNotVipInvited: "Корисникот не е поканет во ВИП.",
  userNotVipMember: "Корисникот не е член на ВИП.",
  userVipBanned: "Корисникот е баниран од ВИП.",
  userVipInvited: "Корисникот е поканет во ВИП.",
  userVipMember: "Корисникот е член на ВИП.",
  userVipPending: "Постои предлог за овој корисник.",
  vipBansFetchFailed: "Превземањето на забраните беше неуспешно.",
  vipPollsFetchFailed: "Превземањето на ВИП анкетите беше неуспешно.",
};

export const commandErrorFunctions = {
  invalidConfiguration: (error: string) =>
    `Дадената конфигурација не е валидна: ${codeBlock("json", error)}`,

  pollNoVotePermission: (roleIds: string[]) =>
    `Немате дозвола да гласате на анкетата. Потребна ви е барем една од улогите: ${roleIds
      .map((roleId) => roleMention(roleId))
      .join(", ")}`,
};

// Log messages

export const logShortStrings = {
  auto: "[Auto]",
  button: "[Button]",
  chat: "[Chat]",
  dm: "DM",
  guild: "Guild",
  pollStats: "Poll Stats",
  user: "[User]",
};

export const logMessages = {
  channelsInitialized: "Channels initialized",
  commandsRegistered: "Commands registered",
  rolesInitialized: "Roles initialized",
};

export const logMessageFunctions = {
  loggedIn: (username: string | undefined) =>
    `Logged in as ${username ?? "an unknown user"}`,

  noRefreshNeeded: (property: string) => `No refresh needed for ${property}`,

  tempVipScheduled: (nextRun: string) =>
    `Temporary VIP channel scheduled for ${nextRun}`,

  userNotQualifiedForVip: (userTag: string) =>
    `User ${userTag} does not qualify for VIP, skipping giving him roles`,
};

// Log errors

export const logErrorFunctions = {
  antoCreateError: (error: unknown) => `Failed creating Anto fact\n${error}`,

  antoDeleteError: (error: unknown) => `Failed deleting Anto fact\n${error}`,

  antoRandomGetError: (error: unknown) =>
    `Failed getting random Anto fact\n${error}`,

  antosCreateError: (error: unknown) => `Failed creating Anto facts\n${error}`,

  antosParseError: (error: unknown) => `Failed parsing Anto facts\n${error}`,

  autocompleteResponseError: (userTag: string, error: unknown) =>
    `Failed responding to autocomplete interaction by ${userTag}\n${error}`,

  buttonInteractionDeferError: (
    interaction: ButtonInteraction,
    error: unknown,
  ) => `Failed deferring button interaction ${interaction.customId}\n${error}`,

  buttonInteractionOutsideGuildError: (customId: string) =>
    `Received button interaction ${customId} outside of a guild`,

  buttonInteractionPollOrOptionNotFoundError: (customId: string) =>
    `Received button interaction ${customId} for a poll that does not exist`,

  buttonInteractionResponseError: (error: unknown) =>
    `Failed responding to button interaction\n${error}`,

  buttonInteractionRoleError: (customId: string) =>
    `Received button interaction ${customId} for a role that does not exist`,

  chatInputInteractionDeferError: (
    interaction: ChatInputCommandInteraction,
    error: unknown,
  ) => `Failed deferring chat input interaction ${interaction}\n${error}`,

  chatInputInteractionError: (
    interaction: ChatInputCommandInteraction,
    error: unknown,
  ) => `Failed handling chat input interaction ${interaction}\n${error}`,

  collectorEndError: (command: string, error: unknown) =>
    `Failed ending ${command} collector\n${error}`,

  commandNotFound: (interactionId: string) =>
    `Command for interaction ${interactionId} not found`,

  commandsRegistrationError: (error: unknown) =>
    `Failed registering application commands\n${error}`,

  companiesCreateError: (error: unknown) =>
    `Failed creating companies\n${error}`,

  companiesGetError: (error: unknown) => `Failed getting companies\n${error}`,

  companiesParseError: (error: unknown) => `Failed parsing companies\n${error}`,

  companyCreateError: (error: unknown) => `Failed creating company\n${error}`,

  companyDeleteError: (error: unknown) => `Failed deleting company\n${error}`,

  configSetError: (error: unknown) => `Failed setting config\n${error}`,

  crosspostError: (channelId: string, error: unknown) =>
    `Failed crossposting message in channel ${channelId}\n${error}`,

  embedSendError: (error: unknown) => `Failed sending embed\n${error}`,

  experienceCountGetError: (error: unknown) =>
    `Failed getting experience count\n${error}`,

  experienceCreateError: (error: unknown) =>
    `Failed creating experience\n${error}`,

  experienceGetError: (error: unknown) => `Failed getting experience\n${error}`,

  faqSendError: (error: unknown) => `Failed sending question\n${error}`,

  interactionLogError: (interactionId: string, error: unknown) =>
    `Failed logging interaction ${interactionId}\n${error}`,

  interactionUpdateError: (command: string, error: unknown) =>
    `Failed updating ${command} interaction\n${error}`,

  invalidButtonInteractionError: (customId: string) =>
    `Invalid button interaction ${customId}`,

  linkSendError: (error: unknown) => `Failed sending link\n${error}`,

  linksParseError: (error: unknown) => `Failed parsing links\n${error}`,

  loginFailed: (error: unknown) => `Failed logging in\n${error}`,

  messageUrlFetchError: (interactionId: string, error: unknown) =>
    `Failed fetching message URL for ${interactionId}\n${error}`,

  reminderLoadError: (error: unknown) => `Failed loading reminders\n${error}`,

  responseDeleteError: (messageId: string, error: unknown) =>
    `Failed deleting message ${messageId}\n${error}`,

  scriptExecutionError: (error: unknown) => `Failed executing script\n${error}`,

  unknownInteractionError: (userId: string) =>
    `Unknown interaction from ${userId}`,

  userContextMenuInteractionDeferError: (
    interaction: UserContextMenuCommandInteraction,
    error: unknown,
  ) =>
    `Failed deferring user context menu interaction ${interaction.commandName}\n${error}`,

  userContextMenuInteractionError: (
    interaction: UserContextMenuCommandInteraction,
    error: unknown,
  ) =>
    `Failed handling user context menu interaction ${interaction.commandName}\n${error}`,
};

// Database errors

export const databaseErrorFunctions = {
  addExperienceByUserIdError: (error: unknown) =>
    `Failed adding experience by user ID\n${error}`,

  addLevelByUserIdError: (error: unknown) =>
    `Failed adding level by user ID\n${error}`,

  countPollVotesByOptionIdError: (error: unknown) =>
    `Failed counting poll votes by option ID\n${error}`,

  createAntoError: (error: unknown) => `Failed creating Anto fact\n${error}`,

  createAntosError: (error: unknown) => `Failed creating Anto facts\n${error}`,

  createCompaniesError: (error: unknown) =>
    `Failed creating companies\n${error}`,

  createCompanyError: (error: unknown) => `Failed creating company\n${error}`,

  createExperienceError: (error: unknown) =>
    `Failed creating experience\n${error}`,

  createInfoMessageError: (error: unknown) =>
    `Failed creating info message\n${error}`,

  createLinkError: (error: unknown) => `Failed creating link\n${error}`,

  createPollError: (error: unknown) => `Failed creating poll\n${error}`,

  createPollOptionError: (error: unknown) =>
    `Failed creating poll option\n${error}`,

  createPollVoteError: (error: unknown) =>
    `Failed creating poll vote\n${error}`,

  createQuestionError: (error: unknown) => `Failed creating question\n${error}`,

  createQuestionLinkError: (error: unknown) =>
    `Failed creating question link\n${error}`,

  createQuestionLinksError: (error: unknown) =>
    `Failed creating question links\n${error}`,

  createReminderError: (error: unknown) => `Failed creating reminder\n${error}`,

  createRuleError: (error: unknown) => `Failed creating rule\n${error}`,

  createVipBanError: (error: unknown) => `Failed creating VIP ban\n${error}`,

  createVipPollError: (error: unknown) => `Failed creating VIP poll\n${error}`,

  deleteAntoError: (error: unknown) => `Failed deleting Anto fact\n${error}`,

  deleteCompanyError: (error: unknown) => `Failed deleting company\n${error}`,

  deleteInfoMessageError: (error: unknown) =>
    `Failed deleting info message\n${error}`,

  deleteLinkError: (error: unknown) => `Failed deleting link\n${error}`,

  deletePollError: (error: unknown) => `Failed deleting poll\n${error}`,

  deletePollOptionError: (error: unknown) =>
    `Failed deleting poll option\n${error}`,

  deletePollOptionsByPollIdAndNameError: (error: unknown) =>
    `Failed deleting poll options by poll ID and name\n${error}`,

  deletePollVoteError: (error: unknown) =>
    `Failed deleting poll vote\n${error}`,

  deleteQuestionError: (error: unknown) => `Failed deleting question\n${error}`,

  deleteQuestionLinksByQuestionIdError: (error: unknown) =>
    `Failed deleting question links by question ID\n${error}`,

  deleteReminderError: (error: unknown) => `Failed deleting reminder\n${error}`,

  deleteRemindersError: (error: unknown) =>
    `Failed deleting reminders\n${error}`,

  deleteRuleError: (error: unknown) => `Failed deleting rule\n${error}`,

  deleteVipBanError: (error: unknown) => `Failed deleting VIP ban\n${error}`,

  deleteVipPollByPollIdError: (error: unknown) =>
    `Failed deleting VIP poll\n${error}`,

  deleteVipPollError: (error: unknown) => `Failed deleting VIP poll\n${error}`,

  getCompaniesError: (error: unknown) => `Failed getting companies\n${error}`,

  getExperienceByUserIdError: (error: unknown) =>
    `Failed getting experience by user ID\n${error}`,

  getExperienceCountError: (error: unknown) =>
    `Failed getting experience count\n${error}`,

  getExperienceSortedError: (error: unknown) =>
    `Failed getting sorted experience\n${error}`,

  getInfoMessageError: (error: unknown) =>
    `Failed getting info message\n${error}`,

  getInfoMessagesError: (error: unknown) =>
    `Failed getting info messages\n${error}`,

  getLinkError: (error: unknown) => `Failed getting link\n${error}`,

  getLinkNamesError: (error: unknown) => `Failed getting link names\n${error}`,

  getLinksError: (error: unknown) => `Failed getting links\n${error}`,

  getMostPopularOptionByPollIdError: (error: unknown) =>
    `Failed getting most popular option by poll ID\n${error}`,

  getNthLinkError: (error: unknown) => `Failed getting nth link\n${error}`,

  getNthQuestionError: (error: unknown) =>
    `Failed getting nth question\n${error}`,

  getPollByIdError: (error: unknown) => `Failed getting poll by ID\n${error}`,

  getPollOptionByIdError: (error: unknown) =>
    `Failed getting poll option by ID\n${error}`,

  getPollOptionByPollIdAndNameError: (error: unknown) =>
    `Failed getting poll option by poll ID and name\n${error}`,

  getPollsError: (error: unknown) => `Failed getting polls\n${error}`,

  getPollVotesByOptionIdError: (error: unknown) =>
    `Failed getting poll votes by option ID\n${error}`,

  getPollVotesByPollIdAndUserIdError: (error: unknown) =>
    `Failed getting poll votes by poll ID and user ID\n${error}`,

  getPollVotesByPollIdError: (error: unknown) =>
    `Failed getting poll votes by poll ID\n${error}`,

  getQuestionError: (error: unknown) => `Failed getting question\n${error}`,

  getQuestionNamesError: (error: unknown) =>
    `Failed getting question names\n${error}`,

  getQuestionsError: (error: unknown) => `Failed getting questions\n${error}`,

  getRandomAntoError: (error: unknown) =>
    `Failed getting random Anto fact\n${error}`,

  getRemindersError: (error: unknown) => `Failed getting reminders\n${error}`,

  getRulesError: (error: unknown) => `Failed getting rules\n${error}`,

  getVipBanByUserIdError: (error: unknown) =>
    `Failed getting VIP ban by user ID\n${error}`,

  getVipBansError: (error: unknown) => `Failed getting VIP bans\n${error}`,

  getVipPollByIdError: (error: unknown) =>
    `Failed getting VIP poll by ID\n${error}`,

  getVipPollByPollIdError: (error: unknown) =>
    `Failed getting VIP poll\n${error}`,

  getVipPollByUserAndTypeError: (error: unknown) =>
    `Failed getting VIP poll\n${error}`,

  getVipPollsError: (error: unknown) => `Failed getting VIP polls\n${error}`,

  updateExperienceError: (error: unknown) =>
    `Failed updating experience\n${error}`,

  updateInfoMessageError: (error: unknown) =>
    `Failed updating info message\n${error}`,

  updateLinkError: (error: unknown) => `Failed updating link\n${error}`,

  updatePollError: (error: unknown) => `Failed updating poll\n${error}`,

  updateQuestionError: (error: unknown) => `Failed updating question\n${error}`,
};

// Thread messages

export const threadMessageFunctions = {
  companyThreadMessage: (company: string) => `Канал за компанијата ${company}`,

  courseThreadMessage: (course: string) => `Канал за предметот ${course}`,
};

// Embed messages

export const embedMessages = {
  all: "Сите",
  allCommands:
    "Ова се сите достапни команди за вас. Командите може да ги повикате во овој сервер, или во приватна порака.",
  allVipPolls: "Ова се сите достапни анкети за ВИП.",
  breakRules: "Евентуално кршење на правилата може да доведе до санкции",
  chooseNameColor: "Изберете боја за вашето име.",
  chooseNotifications:
    "Изберете за кои типови на објави сакате да добиете нотификации.",
  chooseProgram: "Изберете го смерот на кој студирате.",
  chooseSemesterMassCourseAdd:
    "Земете предмети од одредени семестри чии канали сакате да ги гледате.",
  chooseSemesterMassCourseRemove:
    "Отстранете предмети од одредени семестри чии канали не сакате да ги гледате.",
  chooseYear: "Изберете ја годината на студирање.",
  courseParticipantsInfo:
    "Ова е бројот на студенти кои го запишале предметот за секоја година.",
  courseSummaryInfo: "Ова се сите достапни информации за предметот.",
  massCourseAdd: "Масовно земање предмети",
  massCourseRemove: "Масовно отстранување предмети",
  multipleOptions: "(може да изберете повеќе опции)",
  nameColor: "Боја на име",
  noCourseInformation: "Нема информации за предметот.",
  notifications: "Нотификации",
  onlyOneOption:
    "(може да изберете само една опција, секоја нова опција ја заменува старата)",
  pollEnded: "ГЛАСАЊЕТО Е ЗАВРШЕНО",
  pollInformation: "Информации за анкетата",
  semester: "Семестар",
  studentInformation: "Информации за студентот",
  studentNotFound: "Студентот не е пронајден.",
};

export const embedMessageFunctions = {
  allLinks: (command: string) =>
    `Ова се сите достапни линкови. Користете ${command} за да ги добиете линковите.`,

  allPolls: (all: boolean) => `Ова се сите ${all ? "" : "активни"} анкети.`,

  allQuestions: (command: string) =>
    `Ова се сите достапни прашања. Користете ${command} за да ги добиете одговорите.`,

  semesterN: (n: number | string | undefined) =>
    n === undefined ? "Непознат семестар" : `Семестар ${n}`,
};

export const logEmbedStrings = {
  author: "Author",
  autocompleteInteraction: "Autocomplete Command",
  buttonInteraction: "Button Command",
  channel: "Channel",
  chatInputInteraction: "Chat Input Command",
  command: "Command",
  empty: "Empty",
  option: "Option",
  pollStats: "Poll Stats",
  target: "Target",
  unknown: "Unknown",
  userContextMenuInteraction: "User Context Menu Command",
  value: "Value",
};

// Short strings

export const shortStrings = {
  accreditation: "Акредитација",
  activity: "Активност",
  all: "Сите",
  anonymous: "Анонимно",
  assistants: "Асистенти",
  author: "Автор",
  capacity: "Капацитет",
  closed: "Затворено",
  code: "Код",
  color: "Боја",
  commands: "Команди",
  courses: "Предмети",
  dm: "DM",
  floor: "Кат",
  level: "Ниво",
  link: "Линк",
  links: "Линкови",
  location: "Локација",
  multipleChoice: "Повеќекратен избор",
  no: "Не",
  none: "Нема",
  notifications: "Нотификации",
  open: "Отворено",
  options: "Опции",
  other: "Друго",
  points: "Поени",
  poll: "Анкета",
  polls: "Анкети",
  prerequisites: "Предуслови",
  professors: "Професори",
  program: "Смер",
  questions: "Прашања",
  reminder: "Потсетник",
  requiredMajority: "Потребно мнозинство",
  result: "Резултат",
  rightToVote: "Право на глас",
  roles: "Улоги",
  rules: "Правила",
  type: "Тип",
  unknown: "?",
  votersFor: "Гласачи за",
  votes: "Гласови",
  year: "Година",
  yes: "Да",
};

// Pagination strings

export const paginationStringFunctions = {
  commandPage: (page: number, pages: number, total: number) =>
    `Страна: ${page} / ${pages}  •  Команди: ${total}`,

  membersPage: (page: number, pages: number, total: number) =>
    `Страна: ${page} / ${pages}  •  Членови: ${total}`,

  pollPage: (page: number, pages: number, total: number) =>
    `Страна: ${page} / ${pages}  •  Анкети: ${total}`,
};

// Config errors

export const configErrors = {
  noApplicationId: "APPLICATION_ID environment variable is not defined",
  noToken: "TOKEN environment variable is not defined",
};

// Emojis

export const emojis = {
  "!": "❗",
  "#": "#️⃣",
  "*": "*️⃣",
  "?": "❓",
  "0": "0️⃣",
  "1": "1️⃣",
  "2": "2️⃣",
  "3": "3️⃣",
  "4": "4️⃣",
  "5": "5️⃣",
  "6": "6️⃣",
  "7": "7️⃣",
  "8": "8️⃣",
  "9": "9️⃣",
  "10": "🔟",
  a: "🇦",
  b: "🇧",
  c: "🇨",
  d: "🇩",
  e: "🇪",
  f: "🇫",
  g: "🇬",
  h: "🇭",
  i: "🇮",
  j: "🇯",
  k: "🇰",
  l: "🇱",
  m: "🇲",
  n: "🇳",
  o: "🇴",
  p: "🇵",
  q: "🇶",
  r: "🇷",
  s: "🇸",
  t: "🇹",
  u: "🇺",
  v: "🇻",
  w: "🇼",
  x: "🇽",
  y: "🇾",
  z: "🇿",
};
