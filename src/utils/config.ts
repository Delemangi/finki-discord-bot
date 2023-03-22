import { existsSync, readFileSync } from 'node:fs';

const defaultConfig: Required<BotConfig> = {
  color: '#000000',
  crosspostChannels: [],
  ephemeralReplyTime: 5_000,
  logo: '',
  logs: {
    actions: '',
    commands: '',
  },
  mode: 'prod',
  profiles: {
    dev: {
      applicationId: '',
      token: '',
    },
    prod: {
      applicationId: '',
      token: '',
    },
  },
};

const anto: string[] = JSON.parse(readFileSync('./config/anto.json', 'utf8'));
const classrooms: Classroom[] = JSON.parse(
  readFileSync('./config/classrooms.json', 'utf8'),
);
const config: BotConfig = JSON.parse(
  readFileSync('./config/config.json', 'utf8'),
);
const courses: string[] = JSON.parse(
  readFileSync('./config/courses.json', 'utf8'),
);
const information: CourseInformation[] = JSON.parse(
  readFileSync('./config/information.json', 'utf8'),
);
const links: Link[] = JSON.parse(readFileSync('./config/links.json', 'utf8'));
const participants: CourseParticipants[] = JSON.parse(
  readFileSync('./config/participants.json', 'utf8'),
);
const prerequisites: CoursePrerequisites[] = JSON.parse(
  readFileSync('./config/prerequisites.json', 'utf8'),
);
const professors: CourseStaff[] = JSON.parse(
  readFileSync('./config/professors.json', 'utf8'),
);
const questions: Question[] = JSON.parse(
  readFileSync('./config/questions.json', 'utf8'),
);
const quiz: QuizQuestions = JSON.parse(
  readFileSync('./config/quiz.json', 'utf8'),
);
const responses: CommandResponse[] = JSON.parse(
  readFileSync('./config/responses.json', 'utf8'),
);
const roles: RoleConfig = JSON.parse(
  readFileSync('./config/roles.json', 'utf8'),
);
const rules: string[] = JSON.parse(readFileSync('./config/rules.json', 'utf8'));
const sessions: { [index: string]: string } = JSON.parse(
  readFileSync('./config/sessions.json', 'utf8'),
);
const staff: Staff[] = JSON.parse(readFileSync('./config/staff.json', 'utf8'));

export const getAnto = () => {
  return anto;
};

export const getClassrooms = () => {
  return classrooms;
};

export const getFromBotConfig = <T extends keyof BotConfig>(key: T) => {
  return config[key] ?? defaultConfig[key];
};

export const getCourses = () => {
  return courses;
};

export const getInformation = () => {
  return information;
};

export const getLinks = () => {
  return links;
};

export const getParticipants = () => {
  return participants;
};

export const getProfessors = () => {
  return professors;
};

export const getPrerequisites = () => {
  return prerequisites;
};

export const getQuestions = () => {
  return questions;
};

export const getQuiz = () => {
  return quiz;
};

export const getResponses = () => {
  return responses;
};

export const getFromRoleConfig = <T extends keyof RoleConfig>(key: T) => {
  return roles[key];
};

export const getRules = () => {
  return rules;
};

export const getSessions = () => {
  return sessions;
};

export const getStaff = () => {
  return staff;
};

export const checkConfig = () => {
  if (!existsSync('./config')) {
    throw new Error('Missing config folder');
  }

  const mode = getFromBotConfig('mode');
  const profiles = getFromBotConfig('profiles');

  if (profiles[mode].applicationId === '' || profiles[mode].token === '') {
    throw new Error('Missing profiles');
  }
};

export const getToken = () => {
  return getFromBotConfig('profiles')[getFromBotConfig('mode')].token;
};

export const getApplicationId = () => {
  return getFromBotConfig('profiles')[getFromBotConfig('mode')].applicationId;
};
