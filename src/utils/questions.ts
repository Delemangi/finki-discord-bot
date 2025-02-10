import { closest } from 'fastest-levenshtein';

import {
  getNthQuestion,
  getQuestion,
  getQuestionNames,
} from '../data/Question.js';
import { transformOptions } from './options.js';

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

  const closestLatinQuestion = closest(
    question,
    Object.keys(transformedQuestionNames),
  );
  const closestQuestion = transformedQuestionNames[closestLatinQuestion];

  return await getQuestion(closestQuestion);
};
