import Fuse from 'fuse.js';

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
