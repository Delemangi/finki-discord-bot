import { getConfig, setConfig } from '../data/Config.js';
import { configErrors } from '../translations/errors.js';
import { type BotConfig } from '../types/BotConfig.js';
import { type Classroom } from '../types/Classroom.js';
import { type CourseInformation } from '../types/CourseInformation.js';
import { type CourseParticipants } from '../types/CourseParticipants.js';
import { type CoursePrerequisites } from '../types/CoursePrerequisites.js';
import { type CourseStaff } from '../types/CourseStaff.js';
import { type LevelConfig } from '../types/LevelConfig.js';
import { type RoleConfig } from '../types/RoleConfig.js';
import { type Roles } from '../types/Roles.js';
import { type Staff } from '../types/Staff.js';
import { readFileSync } from 'node:fs';
// eslint-disable-next-line n/prefer-global/process
import { env } from 'node:process';

const defaultConfig: BotConfig = {
  buttonIdleTime: 60_000,
  channels: {
    activity: '',
    commands: '',
    oath: '',
    polls: '',
    vip: '',
  },
  color: '#313183',
  crosspostChannels: [],
  crossposting: true,
  ephemeralReplyTime: 5_000,
  experienceMultipliers: {},
  guild: '810997107376914444',
  leveling: true,
  reactions: {
    add: {},
    remove: {},
  },
  roles: {
    admin: '',
    admins: '',
    booster: '',
    contributor: '',
    council: '',
    fss: '',
    girlies: '',
    moderator: '',
    ombudsman: '',
    regular: '',
    veteran: '',
    vip: '',
  },
  starboard: '',
  temporaryRegularsChannel: {
    cron: '20 4 * * *',
    name: '🚫︱лаб-13',
    parent: '1060626238760300685',
    position: 1,
  },
  temporaryVIPChannel: {
    cron: '20 4 * * *',
    name: '🚪︱задни-соби',
    parent: '1060626238760300685',
    position: 0,
  },
  vipPause: false,
};

const databaseConfig = await getConfig();
const config: BotConfig =
  databaseConfig === null ? defaultConfig : (databaseConfig.value as BotConfig);

export const checkEnvironmentVariables = async () => {
  const token = env['TOKEN'];
  const applicationId = env['APPLICATION_ID'];

  if (token === undefined) {
    throw new Error(configErrors.noToken);
  }

  if (applicationId === undefined) {
    throw new Error(configErrors.noApplicationId);
  }
};

export const getConfigProperty = async <T extends keyof BotConfig>(key: T) => {
  return config[key] ?? defaultConfig[key];
};

export const setConfigProperty = async <T extends keyof BotConfig>(
  key: T,
  value: BotConfig[T],
) => {
  config[key] = value;
  const newValue = await setConfig(config);

  return newValue?.value;
};

export const getRoleProperty = async <T extends Roles>(key: T) => {
  return config.roles?.[key] ?? defaultConfig.roles[key];
};

export const getReactionsProperty = async <T extends 'add' | 'remove'>(
  key: T,
) => {
  return config.reactions?.[key] ?? defaultConfig.reactions[key];
};

export const getExperienceMultiplier = async (channelId: string) => {
  return config.experienceMultipliers?.[channelId] ?? 1;
};

export const getConfigKeys = () => {
  return Object.keys(defaultConfig) as Array<keyof BotConfig>;
};

export const getToken = () => {
  return env['TOKEN'] as string;
};

export const getApplicationId = () => {
  return env['APPLICATION_ID'] as string;
};

const classrooms: Classroom[] = JSON.parse(
  readFileSync('./config/classrooms.json', 'utf8'),
);
const courses: string[] = JSON.parse(
  readFileSync('./config/courses.json', 'utf8'),
);
const information: CourseInformation[] = JSON.parse(
  readFileSync('./config/information.json', 'utf8'),
);
const levels: LevelConfig = JSON.parse(
  readFileSync('./config/levels.json', 'utf8'),
);
const participants: CourseParticipants[] = JSON.parse(
  readFileSync('./config/participants.json', 'utf8'),
);
const prerequisites: CoursePrerequisites[] = JSON.parse(
  readFileSync('./config/prerequisites.json', 'utf8'),
);
const professors: CourseStaff[] = JSON.parse(
  readFileSync('./config/professors.json', 'utf8'),
);
const roles: RoleConfig = JSON.parse(
  readFileSync('./config/roles.json', 'utf8'),
);
const sessions: Record<string, string> = JSON.parse(
  readFileSync('./config/sessions.json', 'utf8'),
);
const staff: Staff[] = JSON.parse(readFileSync('./config/staff.json', 'utf8'));

export const getClassrooms = () => {
  return classrooms;
};

export const getCourses = () => {
  return courses;
};

export const getInformation = () => {
  return information;
};

export const getLevels = () => {
  return levels;
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

export const getFromRoleConfig = <T extends keyof RoleConfig>(key: T) => {
  return roles[key];
};

export const getSessions = () => {
  return sessions;
};

export const getStaff = () => {
  return staff;
};
