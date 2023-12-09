import { type CourseType } from "./CourseType.js";
import { type ProgramShorthand } from "./ProgramShorthand.js";

export type CoursePrerequisites = Record<ProgramShorthand, CourseType> & {
  course: string;
  prerequisite: string;
  semester: number;
};
