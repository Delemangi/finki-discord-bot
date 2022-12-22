import { readFileSync } from 'node:fs';

const anto: string[] = JSON.parse(readFileSync('./config/anto.json', 'utf8'));
const classrooms: Classroom[] = JSON.parse(readFileSync('./config/classrooms.json', 'utf8'));
const config: BotConfig = JSON.parse(readFileSync('./config/config.json', 'utf8'));
const courses: string[] = JSON.parse(readFileSync('./config/courses.json', 'utf8'));
const links: Link[] = JSON.parse(readFileSync('./config/links.json', 'utf8'));
const participants: CourseParticipants[] = JSON.parse(readFileSync('./config/participants.json', 'utf8'));
const prerequisites: CoursePrerequisites[] = JSON.parse(readFileSync('./config/prerequisites.json', 'utf8'));
const professors: CourseStaff[] = JSON.parse(readFileSync('./config/professors.json', 'utf8'));
const questions: Question[] = JSON.parse(readFileSync('./config/questions.json', 'utf8'));
const quiz = JSON.parse(readFileSync('./config/quiz.json', 'utf8'));
const roles: RoleConfig = JSON.parse(readFileSync('./config/roles.json', 'utf8'));
const rules: string[] = JSON.parse(readFileSync('./config/rules.json', 'utf8'));
const sessions: { [index: string]: string } = JSON.parse(readFileSync('./config/sessions.json', 'utf8'));
const staff: Staff[] = JSON.parse(readFileSync('./config/staff.json', 'utf8'));

export function getAnto (): string[] {
  return anto;
}

export function getClassrooms (): Classroom[] {
  return classrooms;
}

export function getFromBotConfig<T extends keyof BotConfig> (key: T): BotConfig[T] {
  return config[key];
}

export function getCourses (): string[] {
  return courses;
}

export function getLinks (): Link[] {
  return links;
}

export function getParticipants (): CourseParticipants[] {
  return participants;
}

export function getProfessors (): CourseStaff[] {
  return professors;
}

export function getPrerequisites (): CoursePrerequisites[] {
  return prerequisites;
}

export function getQuestions (): Question[] {
  return questions;
}

export function getQuiz () {
  return quiz;
}

export function getFromRoleConfig<T extends keyof RoleConfig> (key: T): RoleConfig[T] {
  return roles[key];
}

export function getRules (): string[] {
  return rules;
}

export function getSessions (): { [index: string]: string } {
  return sessions;
}

export function getStaff (): Staff[] {
  return staff;
}
