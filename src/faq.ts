import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';

const questions: Question[] = JSON.parse(readFileSync('./config/questions.json', 'utf8'));

export function getAllQuetions (): string[] {
  return questions.map(question => question.name);
}

export function getAllOptions (): Question[] {
  return questions.map(question => {
    return { name: question.name, value: question.name };
  });
}

export function getQuestion (keyword: string): Question {
  return questions.find(question => question.name === keyword) ?? { name: 'No question found', value: 'No question found' };
}

export function getEmbedFromQuestion (question: Question): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('Aqua')
    .setTitle(question.name)
    .setDescription(question.value);
}
