export const embedMessages = {
  all: 'Сите',
  allCommands:
    'Ова се сите достапни команди за вас. Командите може да ги повикате во овој сервер, или во приватна порака.',
  allSpecialPolls: 'Ова се сите достапни специјални анкети.',
  breakRules: 'Евентуално кршење на правилата може да доведе до санкции',
  chooseNameColor: 'Изберете боја за вашето име.',
  chooseNotifications:
    'Изберете за кои типови на објави сакате да добиете нотификации.',
  chooseProgram: 'Изберете го смерот на кој студирате.',
  chooseSemesterMassCourseAdd:
    'Земете предмети од одредени семестри чии канали сакате да ги гледате.',
  chooseSemesterMassCourseRemove:
    'Отстранете предмети од одредени семестри чии канали не сакате да ги гледате.',
  chooseYear: 'Изберете ја годината на студирање.',
  courseInfo: 'Ова се сите достапни информации за предметот од акредитацијата.',
  courseParticipantsInfo:
    'Ова е бројот на студенти кои го запишале предметот за секоја година.',
  courseStaffInfo:
    'Ова се професорите и асистентите кои го држеле предметот последните неколку години.',
  courseSummaryInfo: 'Ова се сите достапни информации за предметот.',
  massCourseAdd: 'Масовно земање предмети',
  massCourseRemove: 'Масовно отстранување предмети',
  multipleOptions: '(може да изберете повеќе опции)',
  nameColor: 'Боја на име',
  noCourseInformation: 'Нема информации за предметот.',
  notifications: 'Нотификации',
  onlyOneOption:
    '(може да изберете само една опција, секоја нова опција ја заменува старата)',
  pollEnded: 'ГЛАСАЊЕТО Е ЗАВРШЕНО',
  pollInformation: 'Информации за анкетата',
  semester: 'Семестар',
  studentInformation: 'Информации за студентот',
  studentNotFound: 'Студентот не е пронајден.',
};

export const embedMessageFunctions = {
  allLinks: (command: string) =>
    `Ова се сите достапни линкови. Користете ${command} за да ги добиете линковите.`,

  allPolls: (all: boolean) => `Ова се сите ${all ? '' : 'активни'} анкети.`,

  allQuestions: (command: string) =>
    `Ова се сите достапни прашања. Користете ${command} за да ги добиете одговорите.`,

  semesterN: (semester: number | string | undefined) =>
    semester === undefined ? 'Непознат семестар' : `Семестар ${semester}`,
};

export const embedLabels = {
  addCourses: 'Add Courses',
  author: 'Author',
  autocompleteInteraction: 'Autocomplete Command',
  buttonInteraction: 'Button Command',
  channel: 'Channel',
  chatInputInteraction: 'Chat Input Command',
  command: 'Command',
  empty: 'Empty',
  messageContextMenuInteraction: 'Message Context Menu Command',
  option: 'Option',
  pollStats: 'Poll Stats',
  removeCourses: 'Remove Courses',
  target: 'Target',
  ticketClose: 'Ticket Close',
  ticketCreate: 'Ticket Create',
  unknown: 'Unknown',
  userContextMenuInteraction: 'User Context Menu Command',
  value: 'Value',
};
