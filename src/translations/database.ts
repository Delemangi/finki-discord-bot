export const databaseErrorFunctions = {
  addExperienceByUserIdError: (error: unknown) =>
    `Failed adding experience by user ID\n${error}`,

  addLevelByUserIdError: (error: unknown) =>
    `Failed adding level by user ID\n${error}`,

  countPollVotesByOptionIdError: (error: unknown) =>
    `Failed counting poll votes by option ID\n${error}`,

  createAntoError: (error: unknown) => `Failed creating Anto fact\n${error}`,

  createAntosError: (error: unknown) => `Failed creating Anto facts\n${error}`,

  createCompaniesError: (error: unknown) =>
    `Failed creating companies\n${error}`,

  createCompanyError: (error: unknown) => `Failed creating company\n${error}`,

  createExperienceError: (error: unknown) =>
    `Failed creating experience\n${error}`,

  createInfoMessageError: (error: unknown) =>
    `Failed creating info message\n${error}`,

  createLinkError: (error: unknown) => `Failed creating link\n${error}`,

  createPollError: (error: unknown) => `Failed creating poll\n${error}`,

  createPollOptionError: (error: unknown) =>
    `Failed creating poll option\n${error}`,

  createPollVoteError: (error: unknown) =>
    `Failed creating poll vote\n${error}`,

  createQuestionError: (error: unknown) => `Failed creating question\n${error}`,

  createQuestionLinkError: (error: unknown) =>
    `Failed creating question link\n${error}`,

  createQuestionLinksError: (error: unknown) =>
    `Failed creating question links\n${error}`,

  createReminderError: (error: unknown) => `Failed creating reminder\n${error}`,

  createRuleError: (error: unknown) => `Failed creating rule\n${error}`,

  createSpecialPollError: (error: unknown) =>
    `Failed creating special poll\n${error}`,

  createVipBanError: (error: unknown) => `Failed creating VIP ban\n${error}`,

  deleteAntoError: (error: unknown) => `Failed deleting Anto fact\n${error}`,

  deleteCompanyError: (error: unknown) => `Failed deleting company\n${error}`,

  deleteInfoMessageError: (error: unknown) =>
    `Failed deleting info message\n${error}`,

  deleteLinkError: (error: unknown) => `Failed deleting link\n${error}`,

  deletePollError: (error: unknown) => `Failed deleting poll\n${error}`,

  deletePollOptionError: (error: unknown) =>
    `Failed deleting poll option\n${error}`,

  deletePollOptionsByPollIdAndNameError: (error: unknown) =>
    `Failed deleting poll options by poll ID and name\n${error}`,

  deletePollVoteError: (error: unknown) =>
    `Failed deleting poll vote\n${error}`,

  deleteQuestionError: (error: unknown) => `Failed deleting question\n${error}`,

  deleteQuestionLinksByQuestionIdError: (error: unknown) =>
    `Failed deleting question links by question ID\n${error}`,

  deleteReminderError: (error: unknown) => `Failed deleting reminder\n${error}`,

  deleteRemindersError: (error: unknown) =>
    `Failed deleting reminders\n${error}`,

  deleteRuleError: (error: unknown) => `Failed deleting rule\n${error}`,

  deleteSpecialPollByPollIdError: (error: unknown) =>
    `Failed deleting special poll\n${error}`,

  deleteSpecialPollError: (error: unknown) =>
    `Failed deleting special poll\n${error}`,

  deleteVipBanError: (error: unknown) => `Failed deleting VIP ban\n${error}`,

  getCompaniesError: (error: unknown) => `Failed getting companies\n${error}`,

  getExperienceByUserIdError: (error: unknown) =>
    `Failed getting experience by user ID\n${error}`,

  getExperienceCountError: (error: unknown) =>
    `Failed getting experience count\n${error}`,

  getExperienceSortedError: (error: unknown) =>
    `Failed getting sorted experience\n${error}`,

  getInfoMessageError: (error: unknown) =>
    `Failed getting info message\n${error}`,

  getInfoMessagesError: (error: unknown) =>
    `Failed getting info messages\n${error}`,

  getLinkError: (error: unknown) => `Failed getting link\n${error}`,

  getLinkNamesError: (error: unknown) => `Failed getting link names\n${error}`,

  getLinksError: (error: unknown) => `Failed getting links\n${error}`,

  getMostPopularOptionByPollIdError: (error: unknown) =>
    `Failed getting most popular option by poll ID\n${error}`,

  getNthLinkError: (error: unknown) => `Failed getting nth link\n${error}`,

  getNthQuestionError: (error: unknown) =>
    `Failed getting nth question\n${error}`,

  getPollByIdError: (error: unknown) => `Failed getting poll by ID\n${error}`,

  getPollOptionByIdError: (error: unknown) =>
    `Failed getting poll option by ID\n${error}`,

  getPollOptionByPollIdAndNameError: (error: unknown) =>
    `Failed getting poll option by poll ID and name\n${error}`,

  getPollsError: (error: unknown) => `Failed getting polls\n${error}`,

  getPollVotesByOptionIdError: (error: unknown) =>
    `Failed getting poll votes by option ID\n${error}`,

  getPollVotesByPollIdAndUserIdError: (error: unknown) =>
    `Failed getting poll votes by poll ID and user ID\n${error}`,

  getPollVotesByPollIdError: (error: unknown) =>
    `Failed getting poll votes by poll ID\n${error}`,

  getQuestionError: (error: unknown) => `Failed getting question\n${error}`,

  getQuestionNamesError: (error: unknown) =>
    `Failed getting question names\n${error}`,

  getQuestionsError: (error: unknown) => `Failed getting questions\n${error}`,

  getRandomAntoError: (error: unknown) =>
    `Failed getting random Anto fact\n${error}`,

  getRemindersError: (error: unknown) => `Failed getting reminders\n${error}`,

  getRulesError: (error: unknown) => `Failed getting rules\n${error}`,

  getSpecialPollByIdError: (error: unknown) =>
    `Failed getting special poll by ID\n${error}`,

  getSpecialPollByPollIdError: (error: unknown) =>
    `Failed getting special poll\n${error}`,

  getSpecialPollByUserAndTypeError: (error: unknown) =>
    `Failed getting special poll\n${error}`,

  getSpecialPollsError: (error: unknown) =>
    `Failed getting special polls\n${error}`,

  getVipBanByUserIdError: (error: unknown) =>
    `Failed getting VIP ban by user ID\n${error}`,

  getVipBansError: (error: unknown) => `Failed getting VIP bans\n${error}`,

  updateExperienceError: (error: unknown) =>
    `Failed updating experience\n${error}`,

  updateInfoMessageError: (error: unknown) =>
    `Failed updating info message\n${error}`,

  updateLinkError: (error: unknown) => `Failed updating link\n${error}`,

  updatePollError: (error: unknown) => `Failed updating poll\n${error}`,

  updateQuestionError: (error: unknown) => `Failed updating question\n${error}`,
};
