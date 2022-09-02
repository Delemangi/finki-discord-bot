import { readFileSync } from 'node:fs';

const botConfig: BotConfig = JSON.parse(readFileSync('./config/config.json', 'utf8'));
const roleConfig: RoleConfig = JSON.parse(readFileSync('./config/roles.json', 'utf8'));
const questionConfig: Question[] = JSON.parse(readFileSync('./config/questions.json', 'utf8'));
const linkConfig: Link[] = JSON.parse(readFileSync('./config/links.json', 'utf8'));
const subjectConfig: { [index: string]: string } = JSON.parse(readFileSync('./config/subjects.json', 'utf8'));

export function getFromBotConfig<T extends keyof BotConfig> (key: T): BotConfig[T] {
  return botConfig[key];
}

export function getFromRoleConfig<T extends keyof RoleConfig> (key: T): RoleConfig[T] {
  return roleConfig[key];
}

export function getQuestions (): Question[] {
  return questionConfig;
}

export function getLinks (): Link[] {
  return linkConfig;
}

export function getSubject (subject: string): string {
  return subjectConfig[subject] ?? 'None';
}
