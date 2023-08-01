import { type QuizDifficulties } from "./QuizDifficulty.js";
import { type QuizQuestion } from "./QuizQuestion.js";

export type QuizQuestions = {
  [index in QuizDifficulties]: QuizQuestion[];
};
