export type RoleConfig = {
  color: string[];
  course: {
    [index: string]: string[];
  };
  courses: {
    [index: string]: string;
  };
  level: string[];
  notification: string[];
  other: string[];
  program: string[];
  year: string[];
};
