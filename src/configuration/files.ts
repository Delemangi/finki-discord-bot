import { ClassroomSchema } from '../types/schemas/Classroom.js';
import { CourseInformationSchema } from '../types/schemas/CourseInformation.js';
import { CourseParticipantsSchema } from '../types/schemas/CourseParticipants.js';
import { CoursePrerequisitesSchema } from '../types/schemas/CoursePrerequisites.js';
import { CourseStaffSchema } from '../types/schemas/CourseStaff.js';
import { LevelConfigSchema } from '../types/schemas/LevelConfig.js';
import {
  type RoleConfig,
  RoleConfigSchema,
} from '../types/schemas/RoleConfig.js';
import { StaffSchema } from '../types/schemas/Staff.js';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';

const options = {
  encoding: 'utf8',
  flag: 'a+',
} as const;

const parseContent = (content: string, fallback: unknown = []): unknown => {
  if (content.length === 0) {
    return fallback;
  }

  return JSON.parse(content);
};

const coursesPromise = readFile('./config/courses.json', options);
const classroomsPromise = readFile('./config/classrooms.json', options);
const infoPromise = readFile('./config/information.json', options);
const levelsPromise = readFile('./config/levels.json', options);
const participantsPromise = readFile('./config/participants.json', options);
const prerequisitesPromise = readFile('./config/prerequisites.json', options);
const professorsPromise = readFile('./config/professors.json', options);
const rolesPromise = readFile('./config/roles.json', options);
const sessionsPromise = readFile('./config/sessions.json', options);
const staffPromise = readFile('./config/staff.json', options);

const [
  coursesRaw,
  classroomsRaw,
  infoRaw,
  levelsRaw,
  participantsRaw,
  prerequisitesRaw,
  professorsRaw,
  rolesRaw,
  sessionsRaw,
  staffRaw,
] = await Promise.all([
  coursesPromise,
  classroomsPromise,
  infoPromise,
  levelsPromise,
  participantsPromise,
  prerequisitesPromise,
  professorsPromise,
  rolesPromise,
  sessionsPromise,
  staffPromise,
]);

const coursesData = parseContent(coursesRaw);
const classroomsData = parseContent(classroomsRaw);
const informationData = parseContent(infoRaw);
const levelsData = parseContent(levelsRaw, {});
const participantsData = parseContent(participantsRaw);
const prerequisitesData = parseContent(prerequisitesRaw);
const professorsData = parseContent(professorsRaw);
const rolesData = parseContent(rolesRaw, {});
const sessionsData = parseContent(sessionsRaw);
const staffData = parseContent(staffRaw);

const coursesDataPromise = z.string().array().parseAsync(coursesData);
const classroomsDataPromise =
  ClassroomSchema.array().parseAsync(classroomsData);
const infoDataPromise =
  CourseInformationSchema.array().parseAsync(informationData);
const levelsDataPromise = LevelConfigSchema.parseAsync(levelsData);
const participantsDataPromise =
  CourseParticipantsSchema.array().parseAsync(participantsData);
const prerequisitesDataPromise =
  CoursePrerequisitesSchema.array().parseAsync(prerequisitesData);
const professorsDataPromise =
  CourseStaffSchema.array().parseAsync(professorsData);
const rolesDataPromise = RoleConfigSchema.parseAsync(rolesData);
const sessionsDataPromise = z.record(z.string()).parseAsync(sessionsData);
const staffDataPromise = StaffSchema.array().parseAsync(staffData);

const [
  courses,
  classrooms,
  information,
  levels,
  participants,
  prerequisites,
  professors,
  roles,
  sessions,
  staff,
] = await Promise.all([
  coursesDataPromise,
  classroomsDataPromise,
  infoDataPromise,
  levelsDataPromise,
  participantsDataPromise,
  prerequisitesDataPromise,
  professorsDataPromise,
  rolesDataPromise,
  sessionsDataPromise,
  staffDataPromise,
]);

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
