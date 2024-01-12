// Commands

import {
  bold,
  codeBlock,
  inlineCode,
  roleMention,
  userMention,
} from 'discord.js';

export const commandDescriptions = {
  about: 'За Discord ботот',
  'admin add': 'Предложи нов администратор',
  'admin remove': 'Отстрани администратор',
  anto: 'Преземи Анто факт',
  classroom: 'Преземи информации за просторија',
  'config get': 'Преземи конфигурација',
  'config set': 'Измени конфигурација',
  'council add': 'Предложи нов член на Советот',
  'council remove': 'Отстрани член од Советот',
  'course info': 'Преземи информации за предмет',
  'course participants': 'Преземи број на слушатели на предмет',
  'course prerequisite': 'Преземи предуслов за предмет',
  'course professors': 'Преземи наставен кадар на предмет',
  'course role': 'Преземи број на корисници во канал на предмет',
  'course summary': 'Преземи информации за предмет',
  'course toggle': 'Земи или отстрани улога за предмет',
  'courses add': 'Земи улоги за многу предмети',
  'courses prerequisite': 'Преземи предмети според предуслов',
  'courses program': 'Преземи предмети според смер',
  'courses remove': 'Отстрани улоги за многу предмети',
  embed: 'Креирај ембед',
  'experience add': 'Додади поени за активност',
  'experience get': 'Преземи ниво и активност',
  'experience leaderboard': 'Преземи листа на членови според активност',
  'experience set': 'Измени поени за активност',
  faq: 'Преземи најчесто поставувано прашање',
  help: 'Преземи листа од сите достапни команди',
  home: 'Преземи линк до изворниот код',
  invite: 'Преземи пристапен линк за серверот',
  link: 'Преземи најчесто баран линк',
  'list links': 'Преземи листа од сите линкови',
  'list questions': 'Преземи листа од сите прашања',
  'manage anto-add': 'Додади Анто факт',
  'manage anto-delete': 'Избриши Анто факт',
  'manage anto-mass-add': 'Додади многу Анто факти',
  'manage company-delete': 'Избриши компанија',
  'manage company-mass-add': 'Додади многу компании',
  'manage company-set': 'Додади или измени компанија',
  'manage infomessage-delete': 'Избриши информативна порака',
  'manage infomessage-set': 'Додади или измени информативна порака',
  'manage link-content': 'Прикажи содржина на линк',
  'manage link-delete': 'Избриши линк',
  'manage link-set': 'Додади или измени линк',
  'manage question-content': 'Прикажи содржина на прашање',
  'manage question-delete': 'Избриши прашање',
  'manage question-set': 'Додади или измени прашање',
  'manage rule-delete': 'Избриши правило',
  'manage rule-set': 'Додади или измени правило',
  'members barred': 'Преземи листа од забранети членови',
  'members count': 'Прикажи број на членови на серверот',
  'members regulars': 'Преземи листа од редовните членови',
  'members vip': 'Преземи ги членовите на ВИП',
  message: 'Испрати порака',
  ping: 'Прикажи време на одзив',
  'poll add': 'Додади опции на анкети',
  'poll close': 'Затвори анкета за гласање',
  'poll create': 'Креирај анкета',
  'poll delete': 'Избриши анкета',
  'poll edit': 'Измени наслов и опис на анкета',
  'poll info': 'Информации за анкета',
  'poll list': 'Преземи листа од сите анкети',
  'poll open': 'Отвори анкета за гласање',
  'poll remove': 'Избриши опции на анкета',
  'poll show': 'Прикажи анкета',
  'poll stats': 'Прикажи статистика за гласови',
  profile: 'Преземи информации за студент',
  purge: 'Бриши пораки',
  question: 'Преземи најчесто поставувано прашање',
  register: 'Регистрирај команди',
  'regulars add': 'Додади нов редовен член',
  'regulars remove': 'Отстрани редовен член',
  reminder: 'Креирај потсетник',
  rules: 'Преземи правила на серверот',
  'script colors': 'Испрати ембед за избирање бои',
  'script courses': 'Испрати ембеди за избирање предмети',
  'script info': 'Испрати ги сите информации за серверот',
  'script notifications': 'Испрати ембед за избирање нотификации',
  'script programs': 'Испрати ембед за избирање смерови',
  'script register': 'Регистрирај команди',
  'script rules': 'Испрати ги правилата на серверот',
  'script vip': 'Испрати ембед за ВИП',
  'script years': 'Испрати ембед за избирање години',
  session: 'Преземи распоред за испитна сесија или колоквиумска недела',
  'special bar': 'Предложи забрана на член',
  'special delete': 'Избриши специјална анкета',
  'special list': 'Прикажи листа од сите специјални анкети',
  'special override': 'Спроведи специјална анкета',
  'special remaining':
    'Прикажи листа од членови кои не гласале на специјална анкета',
  'special unbar': 'Предложи укинување на забрана на корисник',
  staff: 'Преземи информации за професор',
  'statistics color': 'Прикажи статистика за улогите за бои',
  'statistics course': 'Прикажи статистика за улогите за предмети',
  'statistics notification': 'Прикажи статистика за улогите за нотификации',
  'statistics program': 'Прикажи статистика за улогите за програми',
  'statistics server': 'Прикажи статистика за серверот',
  'statistics year': 'Прикажи статистика за улогите за години',
  'vip add': 'Предложи нов член за ВИП',
  'vip recreate': 'Рекреирај го привремениот канал',
  'vip remove': 'Предложи бркање на член на ВИП',
};

export const commandResponses = {
  allCoursesAdded: 'Ги земавте сите предмети.',
  allCoursesRemoved: 'Ги отстранивте сите предмети.',
  antoDeleted: 'Го избришавте Анто фактот.',
  antosCreated: 'Креиравте Анто фактот.',
  commandsRegistered: 'Ги регистриравте командите.',
  companiesCreated: 'Креиравте компании.',
  companyCreated: 'Креиравте компанија.',
  companyDeleted: 'Ја избришавте компанијата.',
  embedCreated: 'Креиравте ембед.',
  faqDeleted: 'Го избришавте прашањето.',
  infoCreated: 'Креиравте информативна порака.',
  infoDeleted: 'Ја избришавте информативната порака.',
  linkDeleted: 'Го избришавте линкот.',
  messageCreated: 'Испративте порака.',
  noBarred: 'Нема членови со забрана.',
  noVoters: 'Нема гласачи.',
  pollClosed: 'Анкетата е затворена.',
  pollDeleted: 'Анкетата е избришана.',
  pollOpen: 'Анкетата е отворена за гласање.',
  pollOptionsAdded: 'Опциите се додадени.',
  pollOptionsDeleted: 'Опциите се избришани.',
  ruleCreated: 'Креиравте правило.',
  ruleDeleted: 'Го избришавте правилото.',
  scriptExecuted: 'Ја извршивте скриптата.',
  temporaryVipChannelRecreated: 'Го рекреиравте привремениот канал.',
  userGivenRegular: 'Го додадовте корисникот во редовните корисници.',
  userRemovedRegular: 'Го отстранивте корисникот од редовните корисници.',
  voteRemoved: 'Го тргнавте гласот.',
};

export const commandResponseFunctions = {
  colorAddedOrRemoved: (roleId: string, added: boolean) =>
    `Ја ${added ? 'земавте' : 'отстранивте'} бојата ${roleMention(roleId)}.`,

  courseAdded: (roleId: string) =>
    `Го земавте предметот ${roleMention(roleId)}. ${bold(
      'НАПОМЕНА',
    )}: препорачано е да ги земате предметите од делот ${inlineCode(
      'Channels & Roles',
    )} најгоре во листата на каналите.`,

  courseAddedOrRemoved: (roleId: string, added: boolean) =>
    `Го ${added ? 'земавте' : 'отстранивте'} предметот ${roleMention(
      roleId,
    )}. ${bold(
      'НАПОМЕНА',
    )}: препорачано е да ги земате предметите од делот ${inlineCode(
      'Channels & Roles',
    )} најгоре во листата на каналите.`,

  courseRemoved: (roleId: string) =>
    `Го отстранивте предметот ${roleMention(roleId)}. ${bold(
      'НАПОМЕНА',
    )}: препорачано е да ги земате предметите од делот ${inlineCode(
      'Channels & Roles',
    )} најгоре во листата на каналите.`,

  deletingMessages: (count: number | string) => `Се бришат ${count} пораки...`,

  experienceAdded: (experience: number | string, userId: string) =>
    `Додадовте ${experience} поени за активност на корисникот ${userMention(
      userId,
    )}.`,

  experienceSet: (experience: number | string, userId: string) =>
    `Ги поставивте поените за активност на корисникот ${userMention(
      userId,
    )} на ${experience}.`,

  multipleClassrooms: (classroom: string) =>
    `${bold(
      'НАПОМЕНА',
    )}: Просторијата ${classroom} постои на повеќе факултети.`,

  notificationAddedOrRemoved: (roleId: string, added: boolean) =>
    `${added ? 'земавте' : 'отстранивте'} нотификации за ${roleMention(
      roleId,
    )}.`,

  ping: (ping: number | string) => `${ping} ms`,

  pollEdited: (edits: string) => `Ја изменивте анкетата (${edits}).`,

  pollOverriden: (decision: string) =>
    `Спроведовте специјална анкета со одлука ${inlineCode(decision)}.`,

  pollStats: (pollTitle: string) =>
    `Преглед на гласовите за анкетата ${inlineCode(pollTitle)}`,

  programAddedOrRemoved: (roleId: string, added: boolean) =>
    `Го ${added ? 'земавте' : 'отстранивте'} смерот ${roleMention(roleId)}.`,

  reminderCreated: (timestamp: string, message: string) =>
    `Креиравте потсетник во ${timestamp} за ${inlineCode(message)}.`,

  seePollChanges: (command: string) =>
    `Користете ${command} за да ги видите промените.`,

  semesterCoursesAdded: (semester: number | string) =>
    `Ги земавте предметите од семестар ${semester}.`,

  semesterCoursesRemoved: (semester: number | string) =>
    `Ги отстранивте предметите од семестар ${semester}.`,

  serverAnimatedEmojiStat: (emojiCount: number, maxCount: number) =>
    `Анимирани емоџиња: ${emojiCount} / ${maxCount}`,

  serverChannelsStat: (channelCount: number) => `Канали: ${channelCount} / 500`,

  serverEmojiStat: (emojiCount: number, maxCount: number) =>
    `Емоџиња: ${emojiCount} / ${maxCount}`,

  serverInvitesStat: (inviteCount: number) => `Покани: ${inviteCount}`,

  serverMembers: (memberCount: number | string | undefined) =>
    `Серверот има ${memberCount ?? 'непознат број на'} членови.`,

  serverMembersStat: (memberCount: number) => `Членови: ${memberCount}`,

  serverRolesStat: (roleCount: number) => `Улоги: ${roleCount} / 250`,

  serverStickersStat: (stickerCount: number, maxCount: number) =>
    `Стикери: ${stickerCount} / ${maxCount}`,

  voteAdded: (option: string) => `Гласавте за ${inlineCode(option)}.`,

  yearAddedOrRemoved: (roleId: string, added: boolean) =>
    `Годината ${roleMention(roleId)} е ${added ? 'земена' : 'отстранета'}.`,
};

export const commandErrors = {
  alreadyVipMember: 'Веќе сте член на ВИП.',
  antoCreationFailed: 'Креирањето на Анто фактот беше неуспешно.',
  antoNotFound: 'Анто фактот не постои.',
  antosCreationFailed: 'Креирањето на Анто фактите беше неуспешно.',
  barsFetchFailed: 'Преземањето на забраните беше неуспешно.',
  buttonNoPermission: 'Командата не е ваша.',
  classroomNotFound: 'Просторијата не постои.',
  commandError:
    'Настана грешка при извршување на командата. Обидете се повторно, или пријавете ја грешката.',
  commandNoPermission: 'Немате дозвола да ја извршите командата.',
  commandNotFound: 'Командата не постои.',
  commandsNotRegistered: 'Регистрирањето на командите беше неуспешно.',
  companiesCreationFailed: 'Креирањето на компаниите беше неуспешно.',
  companyCreationFailed: 'Креирањето на компанијата беше неуспешно.',
  companyNotFound: 'Компанијата не постои.',
  courseNotFound: 'Предметот не постои.',
  dataFetchFailed: 'Преземањето на податоците беше неуспешно.',
  embedSendError: 'Креирањето на ембедот беше неуспешно.',
  faqCreationFailed: 'Креирањето на прашањето беше неуспешно.',
  faqNotFound: 'Прашањето не постои.',
  faqSendFailed: 'Испраќањето на прашањето беше неуспешно.',
  guildFetchFailed: 'Преземањето на серверот беше неуспешно.',
  infoNotFound: 'Информативната порака не постои.',
  invalidAntos: 'Анто фактите се во невалиден формат.',
  invalidChannel: 'Каналот е невалиден.',
  invalidColor: 'Бојата е невалидна.',
  invalidCompanies: 'Компаниите се во невалиден формат.',
  invalidDateTime: 'Датумот и/или времето се невалидни.',
  invalidLink: 'Линкот е невалиден.',
  invalidLinks: 'Линковите се во невалиден формат.',
  invalidRoles: 'Улогите се невалидни.',
  inviteCreationFailed: 'Креирањето на пристапен линк беше неуспешно.',
  linkCreationFailed: 'Креирањето на линкот беше неуспешно.',
  linkNotFound: 'Линкот не постои.',
  linkSendFailed: 'Испраќањето на линкот беше неуспешно.',
  linksFetchFailed: 'Преземањето на линковите беше неуспешно.',
  noAnto: 'Анто фактите не се креирани.',
  oathNoPermission: 'Заклетвата не е ваша.',
  optionNotFound: 'Опцијата не постои.',
  pollAnonymous: 'Анкетата е анонимна.',
  pollCreationFailed: 'Креирањето на анкетата беше неуспешно.',
  pollDeletionFailed: 'Бришењето на анкетата беше неуспешно.',
  pollNoOptions: 'Анкетата нема опции.',
  pollNoPermission: 'Анкетата не е ваша.',
  pollNotFound: 'Анкетата не постои.',
  pollOrOptionNotFound: 'Анкетата или опцијата не постои.',
  pollsFetchFailed: 'Преземањето на анкетите беше неуспешно.',
  pollTooManyOptions: 'Анкетата има премногу опции.',
  pollVotesFetchFailed: 'Преземањето на гласовите беше неуспешно.',
  questionsFetchFailed: 'Преземањето на прашањата беше неуспешно.',
  rulesFetchFailed: 'Преземањето на правилата беше неуспешно.',
  scriptNotExecuted: 'Скриптата не е извршена.',
  serverOnlyCommand: 'Командата се повикува само во серверот.',
  sessionNotFound: 'Сесијата не постои.',
  specialPollsFetchFailed: 'Преземањето на специјалните анкети беше неуспешно.',
  staffNotFound: 'Професорот не постои.',
  userAdmin: 'Корисникот е администратор.',
  userBarred: 'Корисникот е забранет.',
  userBot: 'Корисникот е бот.',
  userCouncilMember: 'Корисникот е член на Советот.',
  userNotAdmin: 'Корисникот не е администратор.',
  userNotBarred: 'Корисникот не е забранет.',
  userNotCouncilMember: 'Корисникот не е член на Советот.',
  userNotFound: 'Корисникот не постои.',
  userNotLevel: 'Корисникот е под потребното ниво.',
  userNotMember: 'Корисникот не е член на серверот.',
  userNotRegular: 'Корисникот не е член од редовните корисници.',
  userNotVipMember: 'Корисникот не е член на ВИП.',
  userRegular: 'Корисникот е член на редовните корисници.',
  userSpecialPending: 'Постои предлог за овој корисник.',
  userVipMember: 'Корисникот е член на ВИП.',
};

export const commandErrorFunctions = {
  invalidConfiguration: (error: string) =>
    `Дадената конфигурација не е валидна: ${codeBlock('json', error)}`,

  pollNoVotePermission: (roleIds: string[]) =>
    `Немате дозвола да гласате на анкетата. Потребна ви е барем една од улогите: ${roleIds
      .map((roleId) => roleMention(roleId))
      .join(', ')}`,
};
