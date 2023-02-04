import {
  existsSync,
  readFileSync
} from 'node:fs';

const defaultConfig: Required<BotConfig> = {
  color: '#000000',
  crosspostChannels: [],
  database: '',
  logo: '',
  logs: {
    actions: '',
    commands: ''
  },
  mode: 'prod',
  profiles: {
    dev: {
      applicationID: '',
      token: ''
    },
    prod: {
      applicationID: '',
      token: ''
    }
  }
};

const anto: string[] = JSON.parse(readFileSync('./config/anto.json', 'utf8'));
const classrooms: Classroom[] = JSON.parse(readFileSync('./config/classrooms.json', 'utf8'));
const config: BotConfig = JSON.parse(readFileSync('./config/config.json', 'utf8'));
const courses: string[] = JSON.parse(readFileSync('./config/courses.json', 'utf8'));
const information: CourseInformation[] = JSON.parse(readFileSync('./config/information.json', 'utf8'));
const links: Link[] = JSON.parse(readFileSync('./config/links.json', 'utf8'));
const participants: CourseParticipants[] = JSON.parse(readFileSync('./config/participants.json', 'utf8'));
const prerequisites: CoursePrerequisites[] = JSON.parse(readFileSync('./config/prerequisites.json', 'utf8'));
const professors: CourseStaff[] = JSON.parse(readFileSync('./config/professors.json', 'utf8'));
const questions: Question[] = JSON.parse(readFileSync('./config/questions.json', 'utf8'));
const quiz = JSON.parse(readFileSync('./config/quiz.json', 'utf8'));
const responses: CommandResponse[] = JSON.parse(readFileSync('./config/responses.json', 'utf8'));
const roles: RoleConfig = JSON.parse(readFileSync('./config/roles.json', 'utf8'));
const rules: string[] = JSON.parse(readFileSync('./config/rules.json', 'utf8'));
const sessions: { [index: string]: string } = JSON.parse(readFileSync('./config/sessions.json', 'utf8'));
const staff: Staff[] = JSON.parse(readFileSync('./config/staff.json', 'utf8'));

export function getAnto () {
  return anto;
}

export function getClassrooms () {
  return classrooms;
}

export function getFromBotConfig<T extends keyof BotConfig> (key: T) {
  return config[key] ?? defaultConfig[key];
}

export function getCourses () {
  return courses;
}

export function getInformation () {
  return information;
}

export function getLinks () {
  return links;
}

export function getParticipants () {
  return participants;
}

export function getProfessors () {
  return professors;
}

export function getPrerequisites () {
  return prerequisites;
}

export function getQuestions () {
  return questions;
}

export function getQuiz () {
  return quiz;
}

export function getResponses () {
  return responses;
}

export function getFromRoleConfig<T extends keyof RoleConfig> (key: T) {
  return roles[key];
}

export function getRules () {
  return rules;
}

export function getSessions () {
  return sessions;
}

export function getStaff () {
  return staff;
}

export function checkConfig () {
  if (!existsSync('./config')) {
    throw new Error('Missing config folder');
  }

  const database = getFromBotConfig('database');
  const mode = getFromBotConfig('mode');
  const profiles = getFromBotConfig('profiles');

  if (database === '') {
    throw new Error('Missing database');
  }

  if (profiles[mode]['applicationID'] === '' || profiles[mode]['token'] === '') {
    throw new Error('Missing profiles');
  }
}

export function getToken () {
  return getFromBotConfig('profiles')[getFromBotConfig('mode')]['token'];
}

export function getApplicationID () {
  return getFromBotConfig('profiles')[getFromBotConfig('mode')]['applicationID'];
}
