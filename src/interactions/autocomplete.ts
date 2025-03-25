import { type AutocompleteInteraction } from 'discord.js';

import {
  getClassrooms,
  getCourses,
  getFromRoleConfig,
  getSessions,
  getStaff,
} from '../configuration/files.js';
import { getLinkNames } from '../data/api/Link.js';
import { getQuestionNames } from '../data/api/Question.js';
import { getCompanies } from '../data/database/Company.js';
import { getRules } from '../data/database/Rule.js';
import { logger } from '../logger.js';
import { logErrorFunctions } from '../translations/logs.js';
import { transformOptions } from '../utils/options.js';
import { createOptions } from './utils.js';

let transformedCourses: Array<[string, string]> | null = null;
let transformedProfessors: Array<[string, string]> | null = null;
let transformedCourseRoles: Array<[string, string]> | null = null;
let transformedSessions: Array<[string, string]> | null = null;
let transformedClassrooms: Array<[string, string]> | null = null;

export const handleCourseAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  transformedCourses ??= Object.entries(transformOptions(getCourses()));

  try {
    await interaction.respond(
      createOptions(transformedCourses, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleProfessorAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  transformedProfessors ??= Object.entries(
    transformOptions(getStaff().map((professor) => professor.name)),
  );

  try {
    await interaction.respond(
      createOptions(transformedProfessors, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleCourseRoleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const courses = getFromRoleConfig('courses');

  if (courses === undefined) {
    return;
  }

  transformedCourseRoles ??= Object.entries(
    transformOptions(Object.values(courses)),
  );

  try {
    await interaction.respond(
      createOptions(transformedCourseRoles, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleQuestionAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const questionNames = await getQuestionNames();

  if (questionNames === null) {
    return;
  }

  try {
    await interaction.respond(
      createOptions(
        Object.entries(transformOptions(questionNames)),
        interaction.options.getFocused(),
      ),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleLinkAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const linkNames = await getLinkNames();

  if (linkNames === null) {
    return;
  }

  try {
    await interaction.respond(
      createOptions(
        Object.entries(transformOptions(linkNames)),
        interaction.options.getFocused(),
      ),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleSessionAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  transformedSessions ??= Object.entries(
    transformOptions(Object.keys(getSessions())),
  );

  try {
    await interaction.respond(
      createOptions(transformedSessions, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleClassroomAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  transformedClassrooms ??= Object.entries(
    transformOptions(
      getClassrooms().map(
        (classroom) => `${classroom.classroom} (${classroom.location})`,
      ),
    ),
  );

  try {
    await interaction.respond(
      createOptions(transformedClassrooms, interaction.options.getFocused()),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleRuleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const rules = await getRules();

  if (rules === null) {
    return;
  }

  try {
    await interaction.respond(
      createOptions(
        Object.entries(transformOptions(rules.map(({ rule }) => rule))),
        interaction.options.getFocused(),
      ),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};

export const handleCompanyAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const companies = await getCompanies();

  if (companies === null) {
    return;
  }

  try {
    await interaction.respond(
      createOptions(
        Object.entries(transformOptions(companies.map(({ name }) => name))),
        interaction.options.getFocused(),
      ),
    );
  } catch (error) {
    logger.error(
      logErrorFunctions.autocompleteResponseError(interaction.user.tag, error),
    );
  }
};
