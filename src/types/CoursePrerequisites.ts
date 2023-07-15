import { type CourseType } from './CourseType.js';
import { type ProgramShorthand } from './ProgramShorthand.js';

export type CoursePrerequisites = {
  course: string;
  prerequisite: string;
  semester: number;
} & { [K in ProgramShorthand]: CourseType };
