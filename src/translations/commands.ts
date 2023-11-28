// Commands

import {
  bold,
  codeBlock,
  inlineCode,
  roleMention,
  userMention,
} from "discord.js";

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
  userGivenRegular: "Го додадовте корисникот во групата на регуларни.",
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
  specialPollsFetchFailed:
    "Превземањето на специјалните анкети беше неуспешно.",
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
};

export const commandErrorFunctions = {
  invalidConfiguration: (error: string) =>
    `Дадената конфигурација не е валидна: ${codeBlock("json", error)}`,

  pollNoVotePermission: (roleIds: string[]) =>
    `Немате дозвола да гласате на анкетата. Потребна ви е барем една од улогите: ${roleIds
      .map((roleId) => roleMention(roleId))
      .join(", ")}`,
};
