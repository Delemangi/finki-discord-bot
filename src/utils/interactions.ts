import { type Poll } from '../entities/Poll.js';
import { deleteResponse, getChannel, log } from './channels.js';
import { getCommand } from './commands.js';
import {
  getClassrooms,
  getCourses,
  getFromRoleConfig,
  getLinks,
  getQuestions,
  getQuiz,
  getSessions,
  getStaff,
} from './config.js';
import {
  createPollVote,
  createVipPoll,
  deletePollVote,
  deleteVipPoll,
  getPoll,
  getPollOptionById,
  getPollOptionByName,
  getPollVotes,
  getPollVotesByOption,
  getPollVotesByUser,
  getVipPollById,
  getVipPollByUser,
  savePoll,
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
  getUserContextMenuCommandEmbed,
} from './embeds.js';
import { createOptions } from './functions.js';
import { logger } from './logger.js';
import { transformOptions } from './options.js';
import {
  getCourseRolesBySemester,
  getMembersWithRoles,
  getRole,
  getRoleFromSet,
  getRoles,
} from './roles.js';
import { errors } from './strings.js';
import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  channelMention,
  ChannelType,
  type ChatInputCommandInteraction,
  type GuildMember,
  type GuildMemberRoleManager,
  inlineCode,
  PermissionsBitField,
  roleMention,
  type UserContextMenuCommandInteraction,
  userMention,
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';

// Buttons

const handleCourseButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, 'courses', args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`,
    );
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
    const mess = await interaction.reply({
      content: `Го ${
        removed ? 'отстранивте' : 'земавте'
      } предметот ${inlineCode(
        getFromRoleConfig('courses')[role.name] ?? 'None',
      )}.`,
      ephemeral: true,
    });
    deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`,
    );
  }
};

const handleYearButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, 'year', args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`,
    );
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
    const mess = await interaction.reply({
      content: `Ја ${removed ? 'отстранивте' : 'земавте'} годината ${inlineCode(
        role.name,
      )}.`,
      ephemeral: true,
    });
    deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`,
    );
  }
};

const handleProgramButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, 'program', args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`,
    );
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
    const mess = await interaction.reply({
      content: `Го ${removed ? 'отстранивте' : 'земавте'} смерот ${inlineCode(
        role.name,
      )}.`,
      ephemeral: true,
    });
    deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`,
    );
  }
};

const handleNotificationButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, 'notification', args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`,
    );
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
    const mess = await interaction.reply({
      content: `${
        removed ? 'Исклучивте' : 'Вклучивте'
      } нотификации за ${inlineCode(role.name)}.`,
      ephemeral: true,
    });
    deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`,
    );
  }
};

const handleColorButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  const role = getRoleFromSet(interaction.guild, 'color', args[0]);

  if (role === undefined) {
    logger.warn(
      `The role for button interaction ${interaction.customId} by ${interaction.user.tag} was not found`,
    );
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
    const mess = await interaction.reply({
      content: `Ја ${removed ? 'отстранивте' : 'земавте'} бојата ${inlineCode(
        role.name,
      )}.`,
      ephemeral: true,
    });
    deleteResponse(mess);
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`,
    );
  }
};

const handleAddCoursesButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} without arguments`,
    );
    return;
  }

  const semester = Number(args[0]);
  const member = interaction.member as GuildMember;
  const roles =
    args[0] === 'all'
      ? getRoles(interaction.guild, 'courses')
      : getCourseRolesBySemester(interaction.guild, semester);

  await member.roles.add(roles);

  try {
    await interaction.editReply({
      content:
        args[0] === 'all'
          ? 'Ги земавте сите предмети.'
          : `Ги земавте предметите од семестар ${semester}.`,
    });
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`,
    );
  }
};

const handleRemoveCoursesButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  if (args[0] === undefined) {
    logger.warn(
      `Received button interaction ${interaction.customId} by ${interaction.user.tag} without arguments`,
    );
    return;
  }

  const semester = Number(args[0]);
  const member = interaction.member as GuildMember;
  const roles =
    args[0] === 'all'
      ? getRoles(interaction.guild, 'courses')
      : getCourseRolesBySemester(interaction.guild, semester);

  await member.roles.remove(roles);

  try {
    await interaction.editReply({
      content:
        args[0] === 'all'
          ? 'Ги отстранивте сите предмети.'
          : `Ги отстранивте предметите за семестар ${semester}.`,
    });
  } catch (error) {
    logger.warn(
      `Failed to respond to button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`,
    );
  }
};

const handlePollButtonForVipVote = async (
  interaction: ButtonInteraction,
  poll: Poll,
) => {
  const votes = (await getPollVotes(poll)).filter(
    (vote) => vote.option.name === 'Да',
  );
  const voters = await getMembersWithRoles(interaction.guild, ...poll.roles);

  if (votes.length >= Math.ceil(voters.length / 2)) {
    const channel = getChannel('vip');
    const vipPoll = await getVipPollById(poll.id);
    const member = interaction.guild?.members.cache.find(
      (mem) => mem.id === vipPoll?.user,
    );

    // eslint-disable-next-line require-atomic-updates
    poll.done = true;

    if (channel?.isTextBased()) {
      await channel.send(
        `Корисникот ${userMention(
          vipPoll?.user ?? '',
        )} е одобрен како член на ВИП!`,
      );
    }

    await savePoll(poll);

    if (vipPoll !== null) {
      await deleteVipPoll(vipPoll.id);
    }

    await member?.roles.add(getRole('vip') ?? []);
  }
};

const handlePollButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  const pollId = args[0]?.toString();
  const optionId = args[1]?.toString();
  const poll = await getPoll(pollId);
  const option = await getPollOptionById(optionId);

  if (
    poll === null ||
    option === null ||
    pollId === undefined ||
    optionId === undefined
  ) {
    const mess = await interaction.reply({
      content: 'Веќе не постои анкетата или опцијата.',
      ephemeral: true,
    });
    deleteResponse(mess);
    return;
  }

  const votes = await getPollVotesByUser(poll, interaction.user.id);
  let replyMessage;

  if (poll.done) {
    const mess = await interaction.reply({
      content: 'Анкетата е затворена.',
      ephemeral: true,
    });
    deleteResponse(mess);
    return;
  }

  if (poll.roles.length !== 0) {
    const roles = interaction.member.roles as GuildMemberRoleManager;

    if (!roles.cache.some((role) => poll.roles.includes(role.id))) {
      const mess = await interaction.reply({
        allowedMentions: { parse: [] },
        content: `Немате дозвола да гласате на оваа анкета. Потребна ви е една од улогите: ${poll.roles
          .map((role) => roleMention(role))
          .join(', ')}`,
        ephemeral: true,
      });
      deleteResponse(mess);
      return;
    }
  }

  if (poll.multiple) {
    if (
      votes.length === 0 ||
      !votes.some((vote) => vote.option.id === optionId)
    ) {
      await createPollVote(optionId, interaction.user.id);
      replyMessage = `Гласавте за опцијата ${inlineCode(option.name)}.`;
    } else {
      await deletePollVote(votes.find((vote) => vote.option.id === optionId));
      replyMessage = 'Го тргнавте вашиот глас.';
    }
  } else {
    const vote = votes[0] ?? null;

    if (vote === null) {
      await createPollVote(optionId, interaction.user.id);
      replyMessage = `Гласавте за опцијата ${inlineCode(option.name)}.`;
    } else if (vote !== null && vote.option.id === optionId) {
      await deletePollVote(vote);
      replyMessage = 'Го тргнавте вашиот глас.';
    } else {
      const opt = await getPollOptionByName(poll, optionId);

      if (opt === null) {
        const mess = await interaction.reply({
          content: 'Веќе не постои анкетата или опцијата.',
          ephemeral: true,
        });
        deleteResponse(mess);
        return;
      }

      await deletePollVote(vote);
      await createPollVote(optionId, interaction.user.id);

      replyMessage = `Гласавте за опцијата ${inlineCode(option.name)}.`;
    }
  }

  const message = await interaction.reply({
    content: replyMessage,
    ephemeral: true,
  });
  deleteResponse(message);

  const embed = await getPollEmbed(interaction, poll);
  const components = getPollComponents(poll);
  await interaction.message.edit({
    components,
    embeds: [embed],
  });

  const vipPoll = await getVipPollById(poll.id);
  if (vipPoll !== null) {
    await handlePollButtonForVipVote(interaction, poll);
  }
};

const handlePollStatsButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.guild === null || interaction.member === null) {
    logger.warn(
      `Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`,
    );
    return;
  }

  const id = args[0]?.toString();
  const option = args[1]?.toString();
  const poll = await getPoll(id);

  if (poll === null || id === undefined || option === undefined) {
    logger.warn(
      `Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} for a non-existent poll or option`,
    );
    await interaction.deferUpdate();
    return;
  }

  const pollOption = await getPollOptionByName(poll, option);

  if (pollOption === null) {
    const mess = await interaction.reply({
      content: 'Оваа опција не постои.',
      ephemeral: true,
    });
    deleteResponse(mess);
    return;
  }

  const votes = (await getPollVotesByOption(pollOption)) ?? [];

  await interaction.message.edit({
    components: getPollStatsComponents(poll),
    embeds: [await getPollStatsEmbed(poll)],
  });

  const embed = await getPollStatsButtonEmbed(poll.id, pollOption.name, votes);
  const message = await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
  deleteResponse(message);
};

const handleQuizButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.user.id !== args[0]) {
    const mess = await interaction.reply({
      content: errors.quizNoPermission,
      ephemeral: true,
    });
    deleteResponse(mess);
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
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.guild?.channels.cache.find(
    (ch) => ch.name === `🎲︱квиз-${interaction.user.tag}`,
  );

  if (channel !== undefined) {
    const mess = await interaction.reply({
      content: `Веќе имате друг квиз отворено: ${channelMention(channel.id)}`,
      ephemeral: true,
    });
    deleteResponse(mess);
    return;
  }

  const quizChannel = await interaction.guild?.channels.create({
    name: `🎲︱квиз-${interaction.user.tag}`,
    parent: '813137952900513892',
    permissionOverwrites: [
      {
        deny: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
        id: interaction.guild.id,
      },
      {
        allow: [PermissionsBitField.Flags.ViewChannel],
        id: interaction.user.id,
      },
    ],
    type: ChannelType.GuildText,
  });

  const quizEmbed = getQuizBeginEmbed();
  const components = getQuizBeginComponents(interaction);
  await quizChannel?.send({
    components,
    content: userMention(interaction.user.id),
    embeds: [quizEmbed],
  });
  await interaction.message.delete();
  const message = await interaction.reply({
    content: 'Направен е канал за вас. Со среќа!',
    ephemeral: true,
  });
  deleteResponse(message);
};

const handleQuizGameButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  if (interaction.user.id !== args[0]) {
    const mess = await interaction.reply({
      content: errors.quizNoPermission,
      ephemeral: true,
    });
    deleteResponse(mess);
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
      await interaction.channel?.send(
        'Не го поминавте квизот... Повеќе среќа следен пат.',
      );
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
  const getLevelQuestions =
    getQuiz()[level < 5 ? 'easy' : level < 10 ? 'medium' : 'hard'];
  const currentQuestion = getLevelQuestions[
    Math.floor(Math.random() * getLevelQuestions.length)
  ] as QuizQuestion;

  await interaction.deferUpdate();

  const embed = getQuizQuestionEmbed(currentQuestion, level);
  const components = getQuizQuestionComponents(
    currentQuestion,
    level,
    interaction.user.id,
  );
  await interaction.message.edit({
    components,
    embeds: [embed],
  });
};

const handleVipButton = async (
  interaction: ButtonInteraction,
  args: string[],
) => {
  const member = interaction.member as GuildMember;

  if (
    member.permissions.has(PermissionsBitField.Flags.Administrator) ||
    member.roles.cache.has(getRole('vip')?.id ?? '') ||
    member.roles.cache.has(getRole('admin')?.id ?? '') ||
    member.roles.cache.has(getRole('ombudsman')?.id ?? '')
  ) {
    const message = await interaction.reply({
      content: 'Веќе сте член на ВИП.',
      ephemeral: true,
    });
    deleteResponse(message);
    return;
  }

  if (args[0] !== 'accept') {
    if (
      interaction.channel !== null &&
      !interaction.channel.isDMBased() &&
      interaction.channel.isTextBased() &&
      !interaction.channel.isThread()
    ) {
      await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: false,
      });
    }

    await interaction.deferUpdate();
    return;
  }

  const role = getRole('vip');

  if (role === undefined) {
    return;
  }

  const existingPoll = await getVipPollByUser(interaction.user.id);
  if (existingPoll !== null) {
    const message = await interaction.reply({
      content: 'Веќе имате активна молба за ВИП.',
      ephemeral: true,
    });
    deleteResponse(message);
    return;
  }

  const poll = await createVipPoll(interaction.user);
  const channel = getChannel('polls');

  if (channel?.isTextBased() && poll !== null) {
    await channel.send({
      components: getPollComponents(poll),
      embeds: [await getPollEmbed(interaction, poll)],
    });
  }

  const mess = await interaction.reply({
    content:
      'Испратена е молба за разгледување до членовите на ВИП. Со среќа! :grin:',
    ephemeral: true,
  });
  deleteResponse(mess);
};

// Autocomplete interactions

let transformedCourses: Array<[string, string]> | null = null;
let transformedProfessors: Array<[string, string]> | null = null;
let transformedCourseRoles: Array<[string, string]> | null = null;
let transformedQuestions: Array<[string, string]> | null = null;
let transformedLinks: Array<[string, string]> | null = null;
let transformedSessions: Array<[string, string]> | null = null;
let transformedClassrooms: Array<[string, string]> | null = null;

const handleCourseAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedCourses === null) {
    transformedCourses = Object.entries(transformOptions(getCourses()));
  }

  await interaction.respond(
    createOptions(transformedCourses, interaction.options.getFocused()),
  );
};

const handleProfessorAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedProfessors === null) {
    transformedProfessors = Object.entries(
      transformOptions(getStaff().map((professor) => professor.name)),
    );
  }

  await interaction.respond(
    createOptions(transformedProfessors, interaction.options.getFocused()),
  );
};

const handleCourseRoleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedCourseRoles === null) {
    transformedCourseRoles = Object.entries(
      transformOptions(Object.values(getFromRoleConfig('courses'))),
    );
  }

  await interaction.respond(
    createOptions(transformedCourseRoles, interaction.options.getFocused()),
  );
};

const handleQuestionAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedQuestions === null) {
    transformedQuestions = Object.entries(
      transformOptions(getQuestions().map((question) => question.question)),
    );
  }

  await interaction.respond(
    createOptions(transformedQuestions, interaction.options.getFocused()),
  );
};

const handleLinkAutocomplete = async (interaction: AutocompleteInteraction) => {
  if (transformedLinks === null) {
    transformedLinks = Object.entries(
      transformOptions(getLinks().map((link) => link.name)),
    );
  }

  await interaction.respond(
    createOptions(
      Object.entries(transformOptions(getLinks().map((link) => link.name))),
      interaction.options.getFocused(),
    ),
  );
};

export const handleSessionAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  if (transformedSessions === null) {
    transformedSessions = Object.entries(
      transformOptions(Object.keys(getSessions())),
    );
  }

  await interaction.respond(
    createOptions(transformedSessions, interaction.options.getFocused()),
  );
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

  await interaction.respond(
    createOptions(transformedClassrooms, interaction.options.getFocused()),
  );
};

// Interactions

const ignoredButtons = ['help'];

export const handleChatInputCommand = async (
  interaction: ChatInputCommandInteraction,
) => {
  const command = await getCommand(interaction.commandName);

  if (command === undefined) {
    logger.warn(
      `No command was found for the chat input command ${interaction} by ${interaction.user.tag}`,
    );
    return;
  }

  try {
    await interaction.deferReply();
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      `Failed to handle chat input command ${interaction} by ${interaction.user.tag}\n${error}`,
    );
  }

  logger.info(
    `[Chat] ${interaction.user.tag}: ${interaction} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? 'DM'
        : 'Guild'
    }]`,
  );
  await log(
    await getChatInputCommandEmbed(interaction),
    interaction,
    'commands',
  );
};

export const handleUserContextMenuCommand = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  const command = await getCommand(interaction.commandName);

  if (command === undefined) {
    logger.warn(
      `No command was found for the user context menu command ${interaction.commandName} by ${interaction.user.tag}`,
    );
    return;
  }

  try {
    await interaction.deferReply();
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      `Failed to handle user context menu command ${interaction.commandName} by ${interaction.user.tag}\n${error}`,
    );
  }

  logger.info(
    `[User] ${interaction.user.tag}: ${interaction.commandName} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? 'DM'
        : 'Guild'
    }]`,
  );
  await log(
    await getUserContextMenuCommandEmbed(interaction),
    interaction,
    'commands',
  );
};

const buttonInteractionHandlers = {
  addCourses: handleAddCoursesButton,
  color: handleColorButton,
  course: handleCourseButton,
  notification: handleNotificationButton,
  poll: handlePollButton,
  pollStats: handlePollStatsButton,
  program: handleProgramButton,
  quiz: handleQuizButton,
  quizGame: handleQuizGameButton,
  removeCourses: handleRemoveCoursesButton,
  vip: handleVipButton,
  year: handleYearButton,
};

export const handleButton = async (interaction: ButtonInteraction) => {
  const [command, ...args] = interaction.customId.split(':');

  if (command === undefined) {
    logger.warn(
      `Received bad button interaction ${interaction.customId} by ${interaction.user.tag}`,
    );
    return;
  }

  if (command === 'removeCourses' || command === 'addCourses') {
    try {
      const mess = await interaction.deferReply({ ephemeral: true });
      deleteResponse(mess, 10_000);
    } catch (error) {
      logger.error(
        `Failed to defer reply for button interaction ${interaction.customId} by ${interaction.user.tag}\n${error}`,
      );
    }
  }

  if (Object.keys(buttonInteractionHandlers).includes(command)) {
    await buttonInteractionHandlers[
      command as keyof typeof buttonInteractionHandlers
    ](interaction, args);
  } else if (ignoredButtons.includes(command)) {
    // Do nothing
  } else {
    logger.warn(
      `Received unknown button interaction ${interaction.customId} by ${interaction.user.tag}`,
    );
  }

  logger.info(
    `[Button] ${interaction.user.tag}: ${interaction.customId} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? 'DM'
        : 'Guild'
    }]`,
  );
  await log(
    getButtonEmbed(interaction, command, args),
    interaction,
    'commands',
  );
};

const autocompleteInteractionHandlers = {
  classroom: handleClassroomAutocomplete,
  course: handleCourseAutocomplete,
  courserole: handleCourseRoleAutocomplete,
  link: handleLinkAutocomplete,
  professor: handleProfessorAutocomplete,
  question: handleQuestionAutocomplete,
  session: handleSessionAutocomplete,
};

export const handleAutocomplete = async (
  interaction: AutocompleteInteraction,
) => {
  const option = interaction.options.getFocused(true);

  if (Object.keys(autocompleteInteractionHandlers).includes(option.name)) {
    await autocompleteInteractionHandlers[
      option.name as keyof typeof autocompleteInteractionHandlers
    ](interaction);
  } else {
    logger.warn(
      `Received unknown autocomplete interaction ${option.name} by ${interaction.user.tag}`,
    );
  }

  logger.info(
    `[Auto] ${interaction.user.tag}: ${option.name} [${
      interaction.channel === null || interaction.channel.isDMBased()
        ? 'DM'
        : 'Guild'
    }]`,
  );
  await log(getAutocompleteEmbed(interaction), interaction, 'commands');
};
