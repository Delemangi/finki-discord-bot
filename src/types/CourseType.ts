export type CourseType =
  | 'задолжителен (изб.)'
  | 'задолжителен'
  | 'изборен'
  | 'нема'
  | `задолжителен (${number})`
  | `изборен (${number})`;
