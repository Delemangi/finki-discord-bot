import { readFile } from 'node:fs/promises';
import { z } from 'zod';

import { type Classroom, ClassroomSchema } from '../lib/schemas/Classroom.js';
import {
  type CourseInformation,
  CourseInformationSchema,
} from '../lib/schemas/CourseInformation.js';
import {
  type CourseParticipants,
  CourseParticipantsSchema,
} from '../lib/schemas/CourseParticipants.js';
import {
  type CoursePrerequisites,
  CoursePrerequisitesSchema,
} from '../lib/schemas/CoursePrerequisites.js';
import {
  type CourseStaff,
  CourseStaffSchema,
} from '../lib/schemas/CourseStaff.js';
import {
  type LevelConfig,
  LevelConfigSchema,
} from '../lib/schemas/LevelConfig.js';
import {
  type RoleConfig,
  RoleConfigSchema,
} from '../lib/schemas/RoleConfig.js';
import { type Staff, StaffSchema } from '../lib/schemas/Staff.js';

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

let courses: string[] = [];
let classrooms: Classroom[] = [];
let information: CourseInformation[] = [];
let levels: LevelConfig = {};
let participants: CourseParticipants[] = [];
let prerequisites: CoursePrerequisites[] = [];
let professors: CourseStaff[] = [];
let roles: RoleConfig = {};
let sessions: Record<string, string> = {};
let staff: Staff[] = [];

export const reloadConfigurationFiles = async () => {
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

  [
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
};

export const getClassrooms = () => classrooms;

export const getCourses = () => courses;

export const getInformation = () => information;

export const getLevels = () => levels;

export const getParticipants = () => participants;

export const getProfessors = () => professors;

export const getPrerequisites = () => prerequisites;

export const getFromRoleConfig = <T extends keyof RoleConfig>(key: T) =>
  roles[key];

export const getSessions = () => sessions;

export const getStaff = () => staff;
