import Fuse from 'fuse.js';

import {
  getClassrooms,
  getCourses,
  getFromRoleConfig,
  getSessions,
  getStaff,
} from '../configuration/files.js';
import { getLink, getLinkNames, getNthLink } from '../data/Link.js';
import {
  getNthQuestion,
  getQuestion,
  getQuestionNames,
} from '../data/Question.js';
import { transformOptions } from './options.js';

export const getClosestCourse = (course: string) => {
  const courses = getCourses();

  // Latin -> Cyrillic
  const transformedCourseNames = transformOptions(courses);

  const fuse = new Fuse(Object.keys(transformedCourseNames), {
    includeScore: true,
    threshold: 0.4,
  });

  const result = fuse.search(course);

  if (result.length === 0) {
    return null;
  }

  const closestLatinCourse = result[0]?.item;

  if (closestLatinCourse === undefined) {
    return null;
  }

  const closestCourse = transformedCourseNames[closestLatinCourse];

  return closestCourse ?? null;
};

export const getClosestStaff = (professor: string) => {
  const professors = getStaff();

  // Latin -> Cyrillic
  const transformedProfessorNames = transformOptions(
    professors.map(({ name }) => name),
  );

  const fuse = new Fuse(Object.keys(transformedProfessorNames), {
    includeScore: true,
    threshold: 0.4,
  });

  const result = fuse.search(professor);

  if (result.length === 0) {
    return null;
  }

  const closestLatinProfessor = result[0]?.item;

  if (closestLatinProfessor === undefined) {
    return null;
  }

  const closestProfessor = transformedProfessorNames[closestLatinProfessor];

  return closestProfessor ?? null;
};

export const getClosestCourseRole = (courseRole: string) => {
  const courseRoles = Object.values(getFromRoleConfig('courses'));

  // Latin -> Cyrillic
  const transformedCourseRoleNames = transformOptions(courseRoles);

  const fuse = new Fuse(Object.keys(transformedCourseRoleNames), {
    includeScore: true,
    threshold: 0.4,
  });

  const result = fuse.search(courseRole);

  if (result.length === 0) {
    return null;
  }

  const closestLatinCourseRole = result[0]?.item;

  if (closestLatinCourseRole === undefined) {
    return null;
  }

  const closestCourseRole = transformedCourseRoleNames[closestLatinCourseRole];

  return closestCourseRole ?? null;
};

export const getClosestQuestion = async (question: number | string) => {
  const isNumber = typeof question === 'number';

  if (isNumber) {
    return await getNthQuestion(question);
  }

  const questions = await getQuestionNames();

  if (questions === null) {
    return null;
  }

  // Latin -> Cyrillic
  const transformedQuestionNames = transformOptions(
    questions.map(({ name }) => name),
  );

  const fuse = new Fuse(Object.keys(transformedQuestionNames), {
    includeScore: true,
    threshold: 0.4,
  });

  const result = fuse.search(question);

  if (result.length === 0) {
    return null;
  }

  const closestLatinQuestion = result[0]?.item;

  if (closestLatinQuestion === undefined) {
    return null;
  }

  const closestQuestion = transformedQuestionNames[closestLatinQuestion];

  return await getQuestion(closestQuestion);
};

export const getClosestLink = async (link: number | string) => {
  const isNumber = typeof link === 'number';

  if (isNumber) {
    return await getNthLink(link);
  }

  const links = await getLinkNames();

  if (links === null) {
    return null;
  }

  // Latin -> Cyrillic
  const transformedLinkNames = transformOptions(links.map(({ name }) => name));

  const fuse = new Fuse(Object.keys(transformedLinkNames), {
    includeScore: true,
    threshold: 0.4,
  });

  const result = fuse.search(link);

  if (result.length === 0) {
    return null;
  }

  const closestLatinLink = result[0]?.item;

  if (closestLatinLink === undefined) {
    return null;
  }

  const closestLink = transformedLinkNames[closestLatinLink];

  return await getLink(closestLink);
};

export const getClosestSession = (session: string) => {
  const sessions = Object.keys(getSessions());

  // Latin -> Cyrillic
  const transformedSessionNames = transformOptions(sessions);

  const fuse = new Fuse(Object.keys(transformedSessionNames), {
    includeScore: true,
    threshold: 0.4,
  });

  const result = fuse.search(session);

  if (result.length === 0) {
    return null;
  }

  const closestLatinSession = result[0]?.item;

  if (closestLatinSession === undefined) {
    return null;
  }

  const closestSession = transformedSessionNames[closestLatinSession];

  return closestSession ?? null;
};

export const getClosestClassroom = (classroom: string) => {
  const classrooms = getClassrooms().map(
    (c) => `${c.classroom} (${c.location})`,
  );

  // Latin -> Cyrillic
  const transformedClassroomNames = transformOptions(classrooms);

  const fuse = new Fuse(Object.keys(transformedClassroomNames), {
    includeScore: true,
    threshold: 0.4,
  });

  const result = fuse.search(classroom);

  if (result.length === 0) {
    return null;
  }

  const closestLatinClassroom = result[0]?.item;

  if (closestLatinClassroom === undefined) {
    return null;
  }

  const closestClassroom = transformedClassroomNames[closestLatinClassroom];

  return closestClassroom ?? null;
};
