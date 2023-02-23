import { log } from './channels.js';
import { getCommand } from './commands.js';
import {
  getClassrooms,
  getCourses,
  getFromBotConfig,
  getFromRoleConfig,
  getLinks,
  getQuestions,
  getQuiz,
  getSessions,
  getStaff
} from './config.js';
import {
  getAutocompleteEmbed,
  getButtonEmbed,
  getChatInputCommandEmbed,
  getUserContextMenuCommandEmbed
} from './embeds.js';
import {
  createOptions,
  generatePercentageBar
} from './functions.js';
import { logger } from './logger.js';
import { transformOptions } from './options.js';
import {
  getRole,
  getRoles
} from './roles.js';
import {
  ActionRowBuilder,
  type AutocompleteInteraction,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ChannelType,
  type ChatInputCommandInteraction,
  codeBlock,
  EmbedBuilder,
  type GuildMemberRoleManager,
  inlineCode,
  PermissionsBitField,
  type UserContextMenuCommandInteraction,
  userMention
} from 'discord.js';
import Keyv from 'keyv';
import { setTimeout } from 'node:timers/promises';

const database = new Keyv(getFromBotConfig('database'));

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
  } else if (command === 'pollstats') {
    await handlePollStatsButton(interaction, args);
  } else if (command === 'quiz') {
    await handleQuizButton(interaction, args);
  } else if (command === 'quizgame') {
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

const quizHelp = 'Добредојдовте во **помош** делот на квизот!\n\n**Како се игра?**\nВо текот на квизот ќе ви бидат поставени 15 прашања поврзани со темата и областа на **ФИНКИ** и **серверот**.\nОдговорете на сите 15 прашања и ќе добиете *две награди*.\nЕдна од наградите е сопствена боја на серверот, а другата за сега е тајна. :face_with_hand_over_mouth:\n\nВо текот на квизот ќе имате 3 алатки за помош:\n- **50 - 50**\n- **друго прашање**\n- **помош од компјутер**\n\nОвие алатки ќе може да ги искористите само до 12-тото прашање, после тоа **НЕ СЕ ДОЗВОЛЕНИ!**\n\nКвизот нема бесконечен број на обиди, **смеете да го играте само 3 пати!**\n\n*Доколку се случи да изгубите еден обид и мислите дека неправедно сте го изгубиле, контактирајте нè за да решиме овој проблем.*\nВи посакуваме **среќна** и **забавна** игра! :smile:';

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
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const pollID = String(args[0]);
  const poll: Poll = await database.get(pollID);

  if (poll === undefined || poll.participants === undefined) {
    logger.warn(`User ${interaction.user.tag} clicked on an old poll`);
    await interaction.deferUpdate();
    return;
  }

  const hasVoted = poll.participants.find((person) => person.id === interaction.user.id);
  const newIndex = Number(args[1]);
  let newVotes = poll.votes;
  const newOptionVotes = poll.optionVotes;
  const newParticipants = poll.participants;
  const userIndex = poll.participants.findIndex((person) => person.id === interaction.user.id);
  let replyMessage: string;

  if (hasVoted && poll.participants[userIndex]?.vote === newIndex) {
    newVotes -= 1;
    newOptionVotes[newIndex] -= 1;
    newParticipants.splice(userIndex, 1);

    replyMessage = 'Го тргнавте вашиот глас.';
  } else if (hasVoted) {
    // @ts-expect-error This cannot happen
    newOptionVotes[poll.participants[userIndex].vote] -= 1;
    newOptionVotes[newIndex] += 1;
    // @ts-expect-error This cannot happen
    newParticipants[userIndex].vote = newIndex;

    replyMessage = `Ја променивте вашата опција во опцијата: ${Number(args[1]) + 1}.`;
  } else {
    newOptionVotes[newIndex] += 1;
    newParticipants.push({
      id: interaction.user.id,
      tag: interaction.user.tag,
      vote: newIndex
    });
    newVotes += 1;

    replyMessage = `Гласавте и ја одбравте опцијата: ${Number(args[1]) + 1}.`;
  }

  await database.set(pollID, {
    isPublic: poll.isPublic,
    options: poll.options,
    optionVotes: newOptionVotes,
    owner: poll.owner,
    participants: newParticipants,
    title: poll.title,
    votes: newVotes
  });

  await interaction.reply({
    content: replyMessage,
    ephemeral: true
  });

  const updatedPoll: Poll = await database.get(pollID);

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(updatedPoll.title)
    .setDescription(codeBlock(updatedPoll.options.map((option, index) => `${String(index + 1).padStart(2, '0')}. ${option.padEnd(Math.max(...updatedPoll.options.map((o) => o.length)))} - [${updatedPoll.votes > 0 ? generatePercentageBar(Number(updatedPoll.optionVotes[index]) / updatedPoll.votes * 100) : generatePercentageBar(0)}] - ${updatedPoll.optionVotes[index]} [${updatedPoll.votes > 0 ? (Number(updatedPoll.optionVotes[index]) / updatedPoll.votes * 100).toFixed(2).padStart(5, '0') : '00'}%]`).join('\n')))
    .addFields(
      {
        inline: true,
        name: 'Гласови',
        value: String(updatedPoll.votes)
      },
      {
        inline: true,
        name: 'Јавна анкета',
        value: updatedPoll.isPublic ? 'Да' : 'Не'
      }
    )
    .setTimestamp()
    .setFooter({ text: `Анкета: ${pollID}` });

  await interaction.message.edit({ embeds: [embed] });
}

async function handlePollStatsButton (interaction: ButtonInteraction, args: string[]) {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const pollId = String(args[0]);
  const pollOption = Number(args[1]);
  const poll: Poll = await database.get(pollId);

  const pollVoters: string[] = [];

  for (const el of poll.participants) {
    if (el.vote === pollOption) {
      pollVoters.push(el.tag);
    }
  }

  let embed: EmbedBuilder;

  if (pollVoters.length > 0) {
    embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Резултати од анкета')
      .setDescription(`Гласачи за ${pollOption + 1}:\n${codeBlock(pollVoters.join('\n'))}`)
      .setTimestamp()
      .setFooter({ text: `ID: ${pollId}` });
  } else {
    embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Резултати од анкета')
      .setDescription(`Никој не гласал за ${pollOption + 1}`)
      .setTimestamp()
      .setFooter({ text: `ID: ${pollId}` });
  }

  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}

async function handleQuizButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.user.id !== args[0]) {
    await interaction.reply({
      content: 'Квизот не е ваш!',
      ephemeral: true
    });
    return;
  }

  if (args[1] === 'n') {
    await interaction.message.delete();
    return;
  }

  if (args[1] === 'h') {
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Кој сака да биде морален победник?')
      .setDescription(quizHelp)
      .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2022' })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
    return;
  }

  if (interaction.guild?.channels.cache.find((c) => c.name === `🎲︱квиз-${interaction.user.tag}`)) {
    await interaction.reply({
      content: 'Веќе имате друг квиз отворено!',
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

  const quizEmbed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Кој сака да биде морален победник?')
    .setDescription('**Започни?**')
    .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2022' })
    .setTimestamp();

  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  const row = new ActionRowBuilder<ButtonBuilder>();
  const buttons: ButtonBuilder[] = [];

  buttons.push(new ButtonBuilder()
    .setCustomId(`quizgame:${interaction.user.id}:y:option:answer:0:0:0:0`)
    .setLabel('Да')
    .setStyle(ButtonStyle.Primary));

  buttons.push(new ButtonBuilder()
    .setCustomId(`quizgame:${interaction.user.id}:n`)
    .setLabel('Не')
    .setStyle(ButtonStyle.Danger));

  row.addComponents(buttons);
  components.push(row);

  await quizChannel?.send({
    components,
    content: userMention(interaction.user.id),
    embeds: [quizEmbed]
  });
  await interaction.message.delete();
  await interaction.reply({
    content: 'Направен е канал за вас. Со среќа! :smile:',
    ephemeral: true
  });
}

async function handleQuizGameButton (interaction: ButtonInteraction, args: string[]) {
  if (interaction.user.id !== args[0]) {
    await interaction.reply({
      content: 'Квизот не е ваш!',
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
      args[4] = String(checkLevel + 1);
    }

    if (args[2] !== args[3]) {
      await interaction.message.delete();
      await interaction.channel?.send({
        content: 'Не го поминавте квизот... Повеќе среќа следен пат.'
      });
      await setTimeout(60_000);
      await interaction.channel?.delete();
      return;
    }

    if (checkLevel + 1 >= 15) {
      await interaction.message.delete();
      await interaction.channel?.send({
        content: 'Честитки! :grin:'
      });
      await setTimeout(60_000);
      await interaction.channel?.delete();
      return;
    }
  }

  const lvl = Number(args[4]);
  const questionsList = getQuiz();
  const getLevelQuestions = questionsList[lvl < 5 ? 'easy' : lvl < 10 ? 'medium' : 'hard'];
  const currentQuestion = getLevelQuestions[Math.floor(Math.random() * getLevelQuestions.length)];

  const quizEmbed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Кој сака да биде морален победник?')
    .setDescription(codeBlock(`Прашање бр. ${lvl + 1}\n\nQ: ${currentQuestion.question}\n${currentQuestion.answers.map((q: string, index: number) => `${index + 1}. ${q}`).join('\n')}`))
    .setTimestamp()
    .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2022' });

  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  const row = new ActionRowBuilder<ButtonBuilder>();
  const buttons: ButtonBuilder[] = [];

  for (let i = 0; i < 4; i++) {
    const button = new ButtonBuilder()
      .setCustomId(`quizgame:${args[0]}:s:${currentQuestion.answers[i]}:${currentQuestion.correctAnswer}:${lvl}:${args[5]}:${args[6]}:${args[7]}`)
      .setLabel(`${i + 1}`)
      .setStyle(ButtonStyle.Primary);
    buttons.push(button);
  }

  row.addComponents(buttons);
  components.push(row);

  /*
  row = new ActionRowBuilder<ButtonBuilder>();
  buttons = [];

  const helpers = [
    {
      action: 'a',
      label: '50:50'
    },
    {
      action: 'b',
      label: 'Замена на прашање'
    },
    {
      action: 'c',
      label: 'Помош од Компјутер'
    }
  ];

  for (const obj of helpers) {
    buttons.push(new ButtonBuilder()
      .setCustomId(`quizgame:${interaction.user.id}:${obj.action}:null:${currentQuestion.correctAnswer}:${lvl}:${args[5]}:${args[6]}:${args[7]}`)
      .setLabel(obj.label)
      .setStyle(ButtonStyle.Secondary));
  }

  row.addComponents(buttons);
  components.push(row);
  */

  await interaction.deferUpdate();
  await interaction.message.edit({
    components,
    embeds: [quizEmbed]
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
