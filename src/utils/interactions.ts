import { log } from './channels.js';
import { getCommand } from './commands.js';
import {
  getClassrooms,
  getCourses,
  getFromRoleConfig,
  getLinks,
  getQuestions,
  getQuiz,
  getSessions,
  getStaff
} from './config.js';
import {
  createPollVote,
  deletePollVote,
  getPoll,
  getPollOption,
  getPollVotesByOption,
  getPollVotesByUser
} from './database.js';
import {
  getAutocompleteEmbed,
  getButtonEmbed,
  getChatInputCommandEmbed,
  getPollComponents,
  getPollEmbed,
  getPollStatsButtonEmbed,
  getPollStatsComponents,
  getPollStatsEmbed,
  getQuizBeginComponents,
  getQuizBeginEmbed,
  getQuizHelpEmbed,
  getQuizQuestionComponents,
  getQuizQuestionEmbed,
  getUserContextMenuCommandEmbed
} from './embeds.js';
import { createOptions } from './functions.js';
import { logger } from './logger.js';
import { transformOptions } from './options.js';
import {
  getRole,
  getRoles
} from './roles.js';
import { errors } from './strings.js';
import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  channelMention,
  ChannelType,
  type ChatInputCommandInteraction,
  type GuildMemberRoleManager,
  inlineCode,
  PermissionsBitField,
  type UserContextMenuCommandInteraction,
  userMention
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';

// Interactions

const ignoredButtons = ['help'];

export async function handleChatInputCommand (interaction: ChatInputCommandInteraction) {
  const command = await getCommand(interaction.commandName);

  if (command === undefined) {
    logger.warn(`No command was found for the chat input command ${interaction} by ${interaction.user.tag}`);
    return;
  }

  try {
    await interaction.deferReply();
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Failed to handle chat input command ${interaction} by ${interaction.user.tag}\n${error}`);
  }

  logger.info(`[Chat] ${interaction.user.tag}: ${interaction} [${interaction.channel === null || interaction.channel.isDMBased() ? 'DM' : 'Guild'}]`);
  await log(await getChatInputCommandEmbed(interaction), interaction, 'commands');
}

export async function handleUserContextMenuCommand (interaction: UserContextMenuCommandInteraction) {
  const command = await getCommand(interaction.commandName);

  if (command === undefined) {
    logger.warn(`No command was found for the user context menu command ${interaction.commandName} by ${interaction.user.tag}`);
    return;
  }

  try {
    await interaction.deferReply();
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Failed to handle user context menu command ${interaction.commandName} by ${interaction.user.tag}\n${error}`);
  }

  logger.info(`[User] ${interaction.user.tag}: ${interaction.commandName} [${interaction.channel === null || interaction.channel.isDMBased() ? 'DM' : 'Guild'}]`);
  await log(await getUserContextMenuCommandEmbed(interaction), interaction, 'commands');
}

export async function handleButton (interaction: ButtonInteraction) {
  const [command, ...args] = interaction.customId.split(':');

  if (command === undefined) {
    logger.warn(`Received bad button interaction ${interaction.customId} by ${interaction.user.tag}`);
    return;
  }

  if (command === 'course') {
    await handleCourseButton(interaction, args);
  } else if (command === 'year') {
    await handleYearButton(interaction, args);
  } else if (command === 'program') {
    await handleProgramButton(interaction, args);
  } else if (command === 'notification') {
    await handleNotificationButton(interaction, args);
  } else if (command === 'activity') {
    await handleActivityButton(interaction, args);
  } else if (command === 'color') {
    await handleColorButton(interaction, args);
  } else if (command === 'poll') {
    await handlePollButton(interaction, args);
  } else if (command === 'pollStats') {
    await handlePollStatsButton(interaction, args);
  } else if (command === 'quiz') {
    await handleQuizButton(interaction, args);
  } else if (command === 'quizGame') {
    await handleQuizGameButton(interaction, args);
  } else if (ignoredButtons.includes(command)) {
    // Do nothing
  } else {
    logger.warn(`Received unknown button interaction ${interaction.customId} by ${interaction.user.tag}`);
  }

  logger.info(`[Button] ${interaction.user.tag}: ${interaction.customId} [${interaction.channel === null || interaction.channel.isDMBased() ? 'DM' : 'Guild'}]`);
  await log(getButtonEmbed(interaction, command, args), interaction, 'commands');
}

export async function handleAutocomplete (interaction: AutocompleteInteraction) {
  const option = interaction.options.getFocused(true);

  if (option.name === 'course') {
    await handleCourseAutocomplete(interaction);
  } else if (option.name === 'professor') {
    await handleProfessorAutocomplete(interaction);
  } else if (option.name === 'courserole') {
    await handleCourseRoleAutocomplete(interaction);
  } else if (option.name === 'question') {
    await handleQuestionAutocomplete(interaction);
  } else if (option.name === 'link') {
    await handleLinkAutocomplete(interaction);
  } else if (option.name === 'session') {
    await handleSessionAutocomplete(interaction);
  } else if (option.name === 'classroom') {
    await handleClassroomAutocomplete(interaction);
  } else {
    logger.warn(`Received unknown autocomplete interaction ${option.name} by ${interaction.user.tag}`);
  }

  logger.info(`[Auto] ${interaction.user.tag}: ${option.name} [${interaction.channel === null || interaction.channel.isDMBased() ? 'DM' : 'Guild'}]`);
  await log(getAutocompleteEmbed(interaction), interaction, 'commands');
}

// Buttons

async function handleCourseButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.guild === null) {
    logger.warn(`Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = getRole(interaction.guild, 'courses', args[0]);

  if (role === undefined) {
    logger.warn(`The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`);
    return;
  }

  // @ts-expect-error The member cannot be null
  const memberRoles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (memberRoles.cache.has(role.id)) {
    await memberRoles.remove(role);
  } else {
    await memberRoles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Го ${removed ? 'отстранивте' : 'земавте'} предметот ${inlineCode(getFromRoleConfig('courses')[role.name] ?? 'None')}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`);
  }
}

async function handleYearButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(`Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = getRole(interaction.guild, 'year', args[0]);

  if (role === undefined) {
    logger.warn(`The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`);
    return;
  }

  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(interaction.guild, 'year'));
    await roles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Ја ${removed ? 'отстранивте' : 'земавте'} годината ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`);
  }
}

async function handleProgramButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(`Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = getRole(interaction.guild, 'program', args[0]);

  if (role === undefined) {
    logger.warn(`The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`);
    return;
  }

  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(interaction.guild, 'program'));
    await roles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Го ${removed ? 'отстранивте' : 'земавте'} смерот ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`);
  }
}

async function handleNotificationButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(`Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = getRole(interaction.guild, 'notification', args[0]);

  if (role === undefined) {
    logger.warn(`The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`);
    return;
  }

  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `${removed ? 'Исклучивте' : 'Вклучивте'} нотификации за ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`);
  }
}

async function handleActivityButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(`Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = getRole(interaction.guild, 'activity', args[0]);

  if (role === undefined) {
    logger.warn(`The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`);
    return;
  }

  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Ја ${removed ? 'отстранивте' : 'земавте'} активноста ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`);
  }
}

async function handleColorButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(`Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = getRole(interaction.guild, 'color', args[0]);

  if (role === undefined) {
    logger.warn(`The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`);
    return;
  }

  const roles = interaction.member.roles as GuildMemberRoleManager;
  let removed = true;

  if (roles.cache.has(role.id)) {
    await roles.remove(role);
  } else {
    await roles.remove(getRoles(interaction.guild, 'color'));
    await roles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Ја ${removed ? 'отстранивте' : 'земавте'} бојата ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`);
  }
}

async function handlePollButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const id = args[0]?.toString();
  const option = args[1]?.toString();
  const poll = await getPoll(id);

  if (poll === null || id === undefined || option === undefined) {
    await interaction.reply({
      content: 'Веќе не постои анкетата или опцијата.',
      ephemeral: true
    });
    return;
  }

  const votes = await getPollVotesByUser(poll, interaction.user.id);
  let replyMessage;

  if (poll.multiple) {
    if (votes.length === 0 || !votes.some((v) => v.option.name === option)) {
      await createPollVote(poll, option, interaction.user.id);
      replyMessage = `Гласавте за опцијата ${inlineCode(option)}.`;
    } else {
      await deletePollVote(votes.find((v) => v.option.name === option));
      replyMessage = 'Го тргнавте вашиот глас.';
    }
  } else {
    const vote = votes.at(0) ?? null;

    if (vote === null) {
      await createPollVote(poll, option, interaction.user.id);
      replyMessage = `Гласавте за опцијата ${inlineCode(option)}.`;
    } else if (vote !== null && vote.option.name === option) {
      await deletePollVote(vote);
      replyMessage = 'Го тргнавте вашиот глас.';
    } else {
      const o = await getPollOption(poll, option);

      if (o === null) {
        await interaction.reply({
          content: 'Веќе не постои анкетата или опцијата.',
          ephemeral: true
        });
        return;
      }

      await deletePollVote(vote);
      await createPollVote(poll, option, interaction.user.id);

      replyMessage = `Гласавте за опцијата ${inlineCode(option)}.`;
    }
  }

  await interaction.reply({
    content: replyMessage,
    ephemeral: true
  });

  const embed = await getPollEmbed(poll);
  const components = getPollComponents(poll);
  await interaction.message.edit({
    components,
    embeds: [embed]
  });
}

async function handlePollStatsButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const id = args[0]?.toString();
  const option = args[1]?.toString();
  const poll = await getPoll(id);

  if (poll === null || id === undefined || option === undefined) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} for a non-existent poll or option`);
    await interaction.deferUpdate();
    return;
  }

  const pollOption = await getPollOption(poll, option);

  if (pollOption === null) {
    await interaction.reply({
      content: 'Оваа опција не постои.',
      ephemeral: true
    });
    return;
  }

  const votes = await getPollVotesByOption(pollOption) ?? [];

  await interaction.message.edit({
    components: getPollStatsComponents(poll),
    embeds: [await getPollStatsEmbed(poll)]
  });

  const embed = await getPollStatsButtonEmbed(poll.id, pollOption.name, votes);
  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}

async function handleQuizButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.user.id !== args[0]) {
    await interaction.reply({
      content: errors['quizNoPermission'],
      ephemeral: true
    });
    return;
  }

  if (args[1] === 'n') {
    await interaction.message.delete();
    return;
  }

  if (args[1] === 'h') {
    const embed = getQuizHelpEmbed();
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
    return;
  }

  const channel = interaction.guild?.channels.cache.find((c) => c.name === `🎲︱квиз-${interaction.user.tag}`);

  if (channel !== undefined) {
    await interaction.reply({
      content: `Веќе имате друг квиз отворено: ${channelMention(channel.id)}`,
      ephemeral: true
    });
    return;
  }

  const quizChannel = await interaction.guild?.channels.create({
    name: `🎲︱квиз-${interaction.user.tag}`,
    parent: '813137952900513892',
    permissionOverwrites: [
      {
        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        id: interaction.guild.id
      },
      {
        allow: [PermissionsBitField.Flags.ViewChannel],
        id: interaction.user.id
      }
    ],
    type: ChannelType.GuildText
  });

  const quizEmbed = getQuizBeginEmbed();
  const components = getQuizBeginComponents(interaction);
  await quizChannel?.send({
    components,
    content: userMention(interaction.user.id),
    embeds: [quizEmbed]
  });
  await interaction.message.delete();
  await interaction.reply({
    content: 'Направен е канал за вас. Со среќа!',
    ephemeral: true
  });
}

async function handleQuizGameButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.user.id !== args[0]) {
    await interaction.reply({
      content: errors['quizNoPermission'],
      ephemeral: true
    });
    return;
  }

  if (args[1] === 'n') {
    await interaction.message.channel.delete();
    return;
  }

  if (args[1] === 's') {
    const checkLevel = Number(args[4]);

    if (args[2] === args[3]) {
      args[4] = (checkLevel + 1).toString();
    } else {
      await interaction.message.delete();
      await interaction.channel?.send('Не го поминавте квизот... Повеќе среќа следен пат.');
      await setTimeout(20_000);
      await interaction.channel?.delete();
      return;
    }

    if (checkLevel + 1 >= 15) {
      await interaction.message.delete();
      await interaction.channel?.send('Честитки! :grin:');
      await setTimeout(20_000);
      await interaction.channel?.delete();
      return;
    }
  }

  const level = Number(args[4]);
  const getLevelQuestions = getQuiz()[level < 5 ? 'easy' : level < 10 ? 'medium' : 'hard'];
  const currentQuestion = getLevelQuestions[Math.floor(Math.random() * getLevelQuestions.length)] as QuizQuestion;

  await interaction.deferUpdate();

  const embed = getQuizQuestionEmbed(currentQuestion, level);
  const components = getQuizQuestionComponents(currentQuestion, level, interaction.user.id);
  await interaction.message.edit({
    components,
    embeds: [embed]
  });
}

// Autocomplete interactions

let transformedCourses: [string, string][] | null = null;
let transformedProfessors: [string, string][] | null = null;
let transformedCourseRoles: [string, string][] | null = null;
let transformedQuestions: [string, string][] | null = null;
let transformedLinks: [string, string][] | null = null;
let transformedSessions: [string, string][] | null = null;
let transformedClassrooms: [string, string][] | null = null;

async function handleCourseAutocomplete (interaction: AutocompleteInteraction) {
  if (transformedCourses === null) {
    transformedCourses = Object.entries(transformOptions(getCourses()));
  }

  await interaction.respond(createOptions(transformedCourses, interaction.options.getFocused()));
}

async function handleProfessorAutocomplete (interaction: AutocompleteInteraction) {
  if (transformedProfessors === null) {
    transformedProfessors = Object.entries(transformOptions(getStaff().map((p) => p.name)));
  }

  await interaction.respond(createOptions(transformedProfessors, interaction.options.getFocused()));
}

async function handleCourseRoleAutocomplete (interaction: AutocompleteInteraction) {
  if (transformedCourseRoles === null) {
    transformedCourseRoles = Object.entries(transformOptions(Object.values(getFromRoleConfig('courses'))));
  }

  await interaction.respond(createOptions(transformedCourseRoles, interaction.options.getFocused()));
}

async function handleQuestionAutocomplete (interaction: AutocompleteInteraction) {
  if (transformedQuestions === null) {
    transformedQuestions = Object.entries(transformOptions(getQuestions().map((q) => q.question)));
  }

  await interaction.respond(createOptions(transformedQuestions, interaction.options.getFocused()));
}

async function handleLinkAutocomplete (interaction: AutocompleteInteraction) {
  if (transformedLinks === null) {
    transformedLinks = Object.entries(transformOptions(getLinks().map((l) => l.name)));
  }

  await interaction.respond(createOptions(Object.entries(transformOptions(getLinks().map((l) => l.name))), interaction.options.getFocused()));
}

async function handleSessionAutocomplete (interaction: AutocompleteInteraction) {
  if (transformedSessions === null) {
    transformedSessions = Object.entries(transformOptions(Object.keys(getSessions())));
  }

  await interaction.respond(createOptions(transformedSessions, interaction.options.getFocused()));
}

async function handleClassroomAutocomplete (interaction: AutocompleteInteraction) {
  if (transformedClassrooms === null) {
    transformedClassrooms = Object.entries(transformOptions(getClassrooms().map((c) => `${c.classroom} (${c.location})`)));
  }

  await interaction.respond(createOptions(transformedClassrooms, interaction.options.getFocused()));
}
