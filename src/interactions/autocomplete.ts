import { getCompanies } from "@app/data/Company.js";
import { getLinkNames } from "@app/data/Link.js";
import { getQuestionNames } from "@app/data/Question.js";
import { getRules } from "@app/data/Rule.js";
import { logErrorFunctions } from "@app/translations/logs.js";
import {
  getClassrooms,
  getCourses,
  getFromRoleConfig,
  getSessions,
  getStaff,
} from "@app/utils/config.js";
import { createOptions } from "@app/utils/functions.js";
import { logger } from "@app/utils/logger.js";
import { transformOptions } from "@app/utils/options.js";
import { type AutocompleteInteraction } from "discord.js";

let transformedCourses: Array<[string, string]> | null = null;
let transformedProfessors: Array<[string, string]> | null = null;
let transformedCourseRoles: Array<[string, string]> | null = null;
let transformedSessions: Array<[string, string]> | null = null;
let transformedClassrooms: Array<[string, string]> | null = null;

export const handleCourseAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedCourses === null) {
    transformedCourses = Object.entries(transformOptions(getCourses()));
  }

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
  if (transformedProfessors === null) {
    transformedProfessors = Object.entries(
      transformOptions(getStaff().map((professor) => professor.name)),
    );
  }

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
  if (transformedCourseRoles === null) {
    transformedCourseRoles = Object.entries(
      transformOptions(Object.values(getFromRoleConfig("courses"))),
    );
  }

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
        Object.entries(transformOptions(questionNames.map(({ name }) => name))),
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
        Object.entries(transformOptions(linkNames.map(({ name }) => name))),
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
  if (transformedSessions === null) {
    transformedSessions = Object.entries(
      transformOptions(Object.keys(getSessions())),
    );
  }

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
  if (transformedClassrooms === null) {
    transformedClassrooms = Object.entries(
      transformOptions(
        getClassrooms().map(
          (classroom) => `${classroom.classroom} (${classroom.location})`,
        ),
      ),
    );
  }

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
