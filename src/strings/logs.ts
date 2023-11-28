import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type UserContextMenuCommandInteraction,
} from "discord.js";

export const logShortStrings = {
  auto: "[Auto]",
  button: "[Button]",
  chat: "[Chat]",
  dm: "DM",
  guild: "Guild",
  pollStats: "Poll Stats",
  user: "[User]",
};

export const logMessages = {
  channelsInitialized: "Channels initialized",
  commandsRegistered: "Commands registered",
  rolesInitialized: "Roles initialized",
};

export const logMessageFunctions = {
  loggedIn: (username: string | undefined) =>
    `Logged in as ${username ?? "an unknown user"}`,

  noRefreshNeeded: (property: string) => `No refresh needed for ${property}`,

  tempVipScheduled: (nextRun: string) =>
    `Temporary VIP channel scheduled for ${nextRun}`,

  userNotQualifiedForVip: (userTag: string) =>
    `User ${userTag} does not qualify for VIP, skipping giving him roles`,
};

export const logErrorFunctions = {
  antoCreateError: (error: unknown) => `Failed creating Anto fact\n${error}`,

  antoDeleteError: (error: unknown) => `Failed deleting Anto fact\n${error}`,

  antoRandomGetError: (error: unknown) =>
    `Failed getting random Anto fact\n${error}`,

  antosCreateError: (error: unknown) => `Failed creating Anto facts\n${error}`,

  antosParseError: (error: unknown) => `Failed parsing Anto facts\n${error}`,

  autocompleteResponseError: (userTag: string, error: unknown) =>
    `Failed responding to autocomplete interaction by ${userTag}\n${error}`,

  buttonInteractionDeferError: (
    interaction: ButtonInteraction,
    error: unknown,
  ) => `Failed deferring button interaction ${interaction.customId}\n${error}`,

  buttonInteractionOutsideGuildError: (customId: string) =>
    `Received button interaction ${customId} outside of a guild`,

  buttonInteractionPollOrOptionNotFoundError: (customId: string) =>
    `Received button interaction ${customId} for a poll that does not exist`,

  buttonInteractionResponseError: (error: unknown) =>
    `Failed responding to button interaction\n${error}`,

  buttonInteractionRoleError: (customId: string) =>
    `Received button interaction ${customId} for a role that does not exist`,

  chatInputInteractionDeferError: (
    interaction: ChatInputCommandInteraction,
    error: unknown,
  ) => `Failed deferring chat input interaction ${interaction}\n${error}`,

  chatInputInteractionError: (
    interaction: ChatInputCommandInteraction,
    error: unknown,
  ) => `Failed handling chat input interaction ${interaction}\n${error}`,

  collectorEndError: (command: string, error: unknown) =>
    `Failed ending ${command} collector\n${error}`,

  commandNotFound: (interactionId: string) =>
    `Command for interaction ${interactionId} not found`,

  commandsRegistrationError: (error: unknown) =>
    `Failed registering application commands\n${error}`,

  companiesCreateError: (error: unknown) =>
    `Failed creating companies\n${error}`,

  companiesGetError: (error: unknown) => `Failed getting companies\n${error}`,

  companiesParseError: (error: unknown) => `Failed parsing companies\n${error}`,

  companyCreateError: (error: unknown) => `Failed creating company\n${error}`,

  companyDeleteError: (error: unknown) => `Failed deleting company\n${error}`,

  configSetError: (error: unknown) => `Failed setting config\n${error}`,

  crosspostError: (channelId: string, error: unknown) =>
    `Failed crossposting message in channel ${channelId}\n${error}`,

  embedSendError: (error: unknown) => `Failed sending embed\n${error}`,

  experienceCountGetError: (error: unknown) =>
    `Failed getting experience count\n${error}`,

  experienceCreateError: (error: unknown) =>
    `Failed creating experience\n${error}`,

  experienceGetError: (error: unknown) => `Failed getting experience\n${error}`,

  faqSendError: (error: unknown) => `Failed sending question\n${error}`,

  interactionLogError: (interactionId: string, error: unknown) =>
    `Failed logging interaction ${interactionId}\n${error}`,

  interactionUpdateError: (command: string, error: unknown) =>
    `Failed updating ${command} interaction\n${error}`,

  invalidButtonInteractionError: (customId: string) =>
    `Invalid button interaction ${customId}`,

  linkSendError: (error: unknown) => `Failed sending link\n${error}`,

  linksParseError: (error: unknown) => `Failed parsing links\n${error}`,

  loginFailed: (error: unknown) => `Failed logging in\n${error}`,

  messageUrlFetchError: (interactionId: string, error: unknown) =>
    `Failed fetching message URL for ${interactionId}\n${error}`,

  reminderLoadError: (error: unknown) => `Failed loading reminders\n${error}`,

  responseDeleteError: (messageId: string, error: unknown) =>
    `Failed deleting message ${messageId}\n${error}`,

  scriptExecutionError: (error: unknown) => `Failed executing script\n${error}`,

  unknownInteractionError: (userId: string) =>
    `Unknown interaction from ${userId}`,

  userContextMenuInteractionDeferError: (
    interaction: UserContextMenuCommandInteraction,
    error: unknown,
  ) =>
    `Failed deferring user context menu interaction ${interaction.commandName}\n${error}`,

  userContextMenuInteractionError: (
    interaction: UserContextMenuCommandInteraction,
    error: unknown,
  ) =>
    `Failed handling user context menu interaction ${interaction.commandName}\n${error}`,
};
