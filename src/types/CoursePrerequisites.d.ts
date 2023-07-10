type CoursePrerequisites = {
  course: string;
  prerequisite: string;
  semester: number;
} & { [K in ProgramValues]: CourseType };
