import { readdirSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
import {
  type BaseInteraction,
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type GuildMemberRoleManager,
  type Role,
  type TextChannel,
  type UserContextMenuCommandInteraction,
  type Message,
  channelMention,
  ChannelType,
  Collection,
  EmbedBuilder,
  inlineCode,
  roleMention,
  userMention,
  codeBlock,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import Keyv from 'keyv';
import { client } from './utils/client.js';
import {
  getClassrooms,
  getCourses,
  getFromBotConfig,
  getFromRoleConfig,
  getQuiz,
  getSessions,
  getStaff
} from './utils/config.js';
import { getCrossposting } from './utils/crossposting.js';
import { getAllQuestions } from './utils/faq.js';
import {
  checkConfig,
  createOptions,
  generatePercentageBar,
  isTextGuildBased
} from './utils/functions.js';
import { logger } from './utils/logger.js';
import { transformOptions } from './utils/options.js';

checkConfig();

const token = getFromBotConfig('token');
const logChannel = getFromBotConfig('logChannel');
const color = getFromBotConfig('color');
const crosspostChannels = getFromBotConfig('crosspostChannels');
const keyv = new Keyv(getFromBotConfig('keyvDB'));

const files = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));
const commands = new Collection<string, Command>();

for (const file of files) {
  const command: Command = await import(`./commands/${file}`);
  commands.set(command.data.name, command);
}

// Events

let logTextChannel: TextChannel;

client.on('interactionCreate', async (interaction: BaseInteraction) => {
  if (interaction.isChatInputCommand()) {
    logger.debug(`Handling chat input command interaction ${interaction.id} from ${interaction.user.id}: ${interaction}`);
    await handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    logger.debug(`Handling button interaction ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
    await handleButton(interaction);
  } else if (interaction.isUserContextMenuCommand()) {
    logger.debug(`Handling user context menu interaction ${interaction.id} from ${interaction.user.id}: ${interaction.commandName} ${interaction.targetId}`);
    await handleUserContextMenuCommand(interaction);
  } else if (interaction.isAutocomplete()) {
    await handleAutocomplete(interaction);
  } else {
    logger.warn(`Received unknown interaction ${interaction.id} from ${interaction.user.id}: ${interaction.toJSON()}`);
  }
});

client.on('messageCreate', async (message: Message) => {
  if (crosspostChannels.length === 0 || !crosspostChannels.includes(message.channel.id)) {
    return;
  }

  if (!getCrossposting()) {
    logger.warn(`Crossposting is disabled, ignoring message ${message.id} from ${message.author.tag} in ${message.channel.id}`);
    return;
  }

  logger.debug(`Received crosspostable message ${message.id} from ${message.author.tag}: ${message}`);

  try {
    await message.crosspost();
    logger.debug(`Crossposted message ${message.id} from ${message.channel.id}`);
  } catch (error) {
    logger.error(`Failed to crosspost message ${message.id} in ${message.channel.id}\n${error}`);
  }
});

client.once('ready', async () => {
  const channel = client.channels.cache.get(logChannel);

  if (channel === undefined || channel.type !== ChannelType.GuildText) {
    throw new Error('The log channel must be a guild text channel');
  }

  logTextChannel = channel;

  await client.application?.commands.fetch();

  logger.info('Bot is ready');
});

try {
  await client.login(token);
  logger.info('Bot logged in');
} catch (error) {
  throw new Error(`Bot failed to login\n${error}`);
}

// Handle commands

const ignoredButtonIDs = ['help'];

async function handleChatInputCommand (interaction: ChatInputCommandInteraction): Promise<void> {
  const command = commands.get(interaction.commandName);

  if (command === undefined) {
    logger.warn(`No command was found for the chat command ${interaction.id}: ${interaction.commandName}`);
    return;
  }

  logger.debug(`Received chat input command interaction ${interaction.id} from ${interaction.user.tag}: ${interaction}`);
  logger.info(`[Chat] ${interaction.user.tag}: ${interaction} [${isTextGuildBased(interaction.channel) ? 'Guild' : 'DM'}]`);

  try {
    await interaction.deferReply();
    await command.execute(interaction);
    logger.debug(`Handled interaction ${interaction.id} from ${interaction.user.id}: ${interaction}`);
  } catch (error) {
    logger.error(`Failed to handle interaction\n${error}`);
  }

  if (interaction.channel?.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Chat Input Command')
      .setAuthor({
        // @ts-expect-error This should never happen, since it's a member
        iconURL: interaction.member.displayAvatarURL(),
        name: interaction.user.tag
      })
      .addFields(
        {
          name: 'Author',
          value: userMention(interaction.user.id)
        },
        {
          name: 'Command',
          value: inlineCode(interaction.toString())
        },
        {
          name: 'Channel',
          value: channelMention(interaction.channel.id)
        }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    try {
      await logTextChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.error(`Failed to send log for interaction ${interaction.id}\n${error}`);
    }
  }

  logger.debug(`Handled chat input command interaction ${interaction.id} from ${interaction.user.id}: ${interaction}`);
}

async function handleButton (interaction: ButtonInteraction): Promise<void> {
  const [command, ...args] = interaction.customId.split(':');

  logger.info(`[Button] ${interaction.user.tag}: ${interaction.customId} [${isTextGuildBased(interaction.channel) ? 'Guild' : 'DM'}]`);

  if (command === 'color') {
    await handleColorButton(interaction, args);
  } else if (command === 'year') {
    await handleYearButton(interaction, args);
  } else if (command === 'activity') {
    await handleActivityButton(interaction, args);
  } else if (command === 'course') {
    await handleCourseButton(interaction, args);
  } else if (command === 'program') {
    await handleProgramButton(interaction, args);
  } else if (command === 'notification') {
    await handleNotificationButton(interaction, args);
  } else if (command === 'poll') {
    await handlePollButton(interaction, args);
  } else if (command === 'pollstats') {
    await handlePollStatsButton(interaction, args);
  } else if (command === 'quiz') {
    await handleQuizStartButton(interaction, args);
  } else if (command === 'quizgame') {
    await handleQuizGameButton(interaction, args);
  } else if (command && ignoredButtonIDs.includes(command)) {
    return;
  } else {
    logger.warn(`Received unknown button interaction ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
    return;
  }

  logger.debug(`Handled button interaction ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
}

async function handleUserContextMenuCommand (interaction: UserContextMenuCommandInteraction): Promise<void> {
  const command = commands.get(interaction.commandName);

  if (command === undefined) {
    logger.warn(`No command was found for the user context menu command ${interaction.id}: ${interaction.commandName}`);
    return;
  }

  logger.info(`[User Context Menu] ${interaction.user.tag}: ${interaction.commandName} [${isTextGuildBased(interaction.channel) ? 'Guild' : 'DM'}]`);

  try {
    await interaction.deferReply();
    await command.execute(interaction);
    logger.debug(`Handled interaction ${interaction.id} from ${interaction.user.id}: ${interaction.commandName} ${interaction.targetId}`);
  } catch (error) {
    logger.error(`Failed to handle interaction\n${error}`);
  }

  if (interaction.channel?.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('User Context Menu')
      .setAuthor({
        // @ts-expect-error The member cannot be null
        iconURL: interaction.member.displayAvatarURL(),
        name: interaction.user.tag
      })
      .addFields(
        {
          name: 'Author',
          value: userMention(interaction.user.id)
        },
        {
          name: 'Command',
          value: inlineCode(interaction.commandName)
        },
        {
          name: 'Channel',
          value: channelMention(interaction.channel.id)
        },
        {
          name: 'Target',
          value: userMention(interaction.targetId)
        }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    try {
      await logTextChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.warn(`Failed to log user context menu interaction ${interaction.id}: ${interaction.commandName} ${interaction.targetId}\n${error}`);
    }
  }

  logger.debug(`Handled user context menu interaction ${interaction.id} from ${interaction.user.id}: ${interaction.commandName} ${interaction.targetId}`);
}

async function handleAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  const option = interaction.options.getFocused(true);

  if (option.name === 'course') {
    await handleCourseAutocomplete(interaction);
  } else if (option.name === 'professor') {
    await handleProfessorAutocomplete(interaction);
  } else if (option.name === 'courserole') {
    await handleCourseRoleAutocomplete(interaction);
  } else if (option.name === 'question') {
    await handleQuestionAutocomplete(interaction);
  } else if (option.name === 'session') {
    await handleSessionAutocomplete(interaction);
  } else if (option.name === 'classroom') {
    await handleClassroomAutocomplete(interaction);
  } else {
    logger.warn(`Received unknown autocomplete interaction ${interaction.id} from ${interaction.user.id}: ${interaction.commandName}, option ${option.name}`);
  }
}

// Buttons interactions

let colorRoles: Role[] = [];
let yearRoles: Role[] = [];
let programRoles: Role[] = [];
const quizHelp = 'Добредојдовте во **помош** делот на квизот!\n\n**Како се игра?**\nВо текот на квизот ќе ви бидат поставени 15 прашања поврзани со темата и областа на **ФИНКИ** и **серверот**.\nОдговорете на сите 15 прашања и ќе добиете *две награди*.\nЕдна од наградите е сопствена боја на серверот, а другата за сега е тајна. :face_with_hand_over_mouth:\n\nВо текот на квизот ќе имате 3 алатки за помош:\n- **50 - 50**\n- **друго прашање**\n- **помош од компјутер**\n\nОвие алатки ќе може да ги искористите само до 12-тото прашање, после тоа **НЕ СЕ ДОЗВОЛЕНИ!**\n\nКвизот нема бесконечен број на обиди, **смеете да го играте само 3 пати!**\n\n*Доколку се случи да изгубите еден обид и мислите дека неправедно сте го изгубиле, контактирајте нè за да решиме овој проблем.*\nВи посакуваме **среќна** и **забавна** игра! :smile:';

async function handleColorButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  if (colorRoles.length === 0) {
    const roles = getFromRoleConfig('color').map((r) => guild.roles.cache.find((ro) => ro.name === r));

    if (roles.includes(undefined)) {
      logger.warn(`One or more roles for button interaction ${interaction.id}: ${interaction.customId} were not found`);
      return;
    }

    colorRoles = roles as Role[];
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (role === undefined) {
    logger.warn(`The role for button interaction ${interaction.id}: ${interaction.customId} was not found`);
    return;
  }

  // @ts-expect-error The member cannot be null
  const memberRoles = member.roles as GuildMemberRoleManager;
  let removed = true;

  if (memberRoles.cache.has(role.id)) {
    await memberRoles.remove(role);
  } else {
    await memberRoles.remove(colorRoles);
    await memberRoles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Ја ${removed ? 'отстранивте' : 'земавте'} бојата ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    return;
  }

  if (interaction.channel?.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Button')
      .setAuthor({
        // @ts-expect-error The member cannot be null
        iconURL: interaction.member.displayAvatarURL(),
        name: interaction.user.tag
      })
      .addFields(
        {
          name: 'Author',
          value: userMention(interaction.user.id)
        },
        {
          name: 'Command',
          value: 'Color'
        },
        {
          name: 'Role',
          value: roleMention(role.id)
        }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    try {
      await logTextChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.warn(`Failed to log button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    }
  }

  logger.debug(`Handled color button ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
}

async function handleYearButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  if (yearRoles.length === 0) {
    const roles = getFromRoleConfig('year').map((r) => guild.roles.cache.find((ro) => ro.name === r));

    if (roles.includes(undefined)) {
      logger.warn(`One or more roles for button interaction ${interaction.id}: ${interaction.customId} were not found`);
      return;
    }

    yearRoles = roles as Role[];
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (role === undefined) {
    logger.warn(`The role was not found for interaction ${interaction.id}: ${interaction.customId}`);
    return;
  }

  // @ts-expect-error The member cannot be null
  const memberRoles = member.roles as GuildMemberRoleManager;
  let removed = true;

  if (memberRoles.cache.has(role.id)) {
    await memberRoles.remove(role);
  } else {
    await memberRoles.remove(yearRoles);
    await memberRoles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Ја ${removed ? 'отстранивте' : 'земавте'} годината ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    return;
  }

  if (interaction.channel?.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Button')
      .setAuthor({
        // @ts-expect-error The member cannot be null
        iconURL: interaction.member.displayAvatarURL(),
        name: interaction.user.tag
      })
      .addFields(
        {
          name: 'Author',
          value: userMention(interaction.user.id)
        },
        {
          name: 'Command',
          value: 'Year'
        },
        {
          name: 'Role',
          value: roleMention(role.id)
        }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    try {
      await logTextChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.warn(`Failed to log button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    }
  }

  logger.debug(`Handled year button ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
}

async function handleActivityButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (role === undefined) {
    logger.warn(`The role was not found for interaction ${interaction.id}: ${interaction.customId}`);
    return;
  }

  // @ts-expect-error The member cannot be null
  const memberRoles = member.roles as GuildMemberRoleManager;
  let removed = true;

  if (memberRoles.cache.has(role.id)) {
    await memberRoles.remove(role);
  } else {
    await memberRoles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Ја ${removed ? 'отстранивте' : 'земавте'} активноста ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    return;
  }

  if (interaction.channel?.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Button')
      .setAuthor({
        // @ts-expect-error The member cannot be null
        iconURL: interaction.member.displayAvatarURL(),
        name: interaction.user.tag
      })
      .addFields(
        {
          name: 'Author',
          value: userMention(interaction.user.id)
        },
        {
          name: 'Command',
          value: 'Activity'
        },
        {
          name: 'Role',
          value: roleMention(role.id)
        }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    try {
      await logTextChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.warn(`Failed to log button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    }
  }

  logger.debug(`Handled activity button ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
}

async function handleCourseButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (role === undefined) {
    logger.warn(`The role was not found for interaction ${interaction.id}: ${interaction.customId}`);
    return;
  }

  // @ts-expect-error The member cannot be null
  const memberRoles = member.roles as GuildMemberRoleManager;
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
    logger.warn(`Failed to respond to button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    return;
  }

  if (interaction.channel?.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Button')
      .setAuthor({
        // @ts-expect-error The member cannot be null
        iconURL: interaction.member.displayAvatarURL(),
        name: interaction.user.tag
      })
      .addFields(
        {
          name: 'Author',
          value: userMention(interaction.user.id)
        },
        {
          name: 'Command',
          value: 'Course'
        },
        {
          name: 'Role',
          value: roleMention(role.id)
        }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    try {
      await logTextChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.warn(`Failed to log button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    }
  }

  logger.debug(`Handled course button ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
}

async function handlePollButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const pollID = String(args[0]);
  const poll: Poll = await keyv.get(pollID);

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

  await keyv.set(pollID, {
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

  const updatedPoll: Poll = await keyv.get(pollID);

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

async function handlePollStatsButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const pollId = String(args[0]);
  const pollOption = Number(args[1]);
  const poll: Poll = await keyv.get(pollId);

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

async function handleQuizStartButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
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

async function handleQuizGameButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
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

async function handleProgramButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  if (programRoles.length === 0) {
    const roles = getFromRoleConfig('program').map((r) => guild.roles.cache.find((ro) => ro.name === r));

    if (roles.includes(undefined)) {
      logger.warn(`One or more roles for button interaction ${interaction.id}: ${interaction.customId} were not found`);
      return;
    }

    programRoles = roles as Role[];
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (role === undefined) {
    logger.warn(`The role was not found for interaction ${interaction.id}: ${interaction.customId}`);
    return;
  }

  // @ts-expect-error The member cannot be null
  const memberRoles = member.roles as GuildMemberRoleManager;
  let removed = true;

  if (memberRoles.cache.has(role.id)) {
    await memberRoles.remove(role);
  } else {
    await memberRoles.remove(programRoles);
    await memberRoles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `Го ${removed ? 'отстранивте' : 'земавте'} смерот ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    return;
  }

  if (interaction.channel?.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Button')
      .setAuthor({
        // @ts-expect-error The member cannot be null
        iconURL: interaction.member.displayAvatarURL(),
        name: interaction.user.tag
      })
      .addFields(
        {
          name: 'Author',
          value: userMention(interaction.user.id)
        },
        {
          name: 'Command',
          value: 'Program'
        },
        {
          name: 'Role',
          value: roleMention(role.id)
        }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    try {
      await logTextChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.warn(`Failed to log button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    }
  }

  logger.debug(`Handled program button ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
}

async function handleNotificationButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (role === undefined) {
    logger.warn(`The role was not found for interaction ${interaction.id}: ${interaction.customId}`);
    return;
  }

  // @ts-expect-error The member cannot be null
  const memberRoles = member.roles as GuildMemberRoleManager;
  let removed = true;

  if (memberRoles.cache.has(role.id)) {
    await memberRoles.remove(role);
  } else {
    await memberRoles.add(role);
    removed = false;
  }

  try {
    await interaction.reply({
      content: `${removed ? 'Исклучивте' : 'Вклучивте'} нотификации за ${inlineCode(role.name)}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    return;
  }

  if (interaction.channel?.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Button')
      .setAuthor({
        // @ts-expect-error The member cannot be null
        iconURL: interaction.member.displayAvatarURL(),
        name: interaction.user.tag
      })
      .addFields(
        {
          name: 'Author',
          value: userMention(interaction.user.id)
        },
        {
          name: 'Command',
          value: 'Notification'
        },
        {
          name: 'Role',
          value: roleMention(role.id)
        }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    try {
      await logTextChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.warn(`Failed to log button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    }
  }

  logger.debug(`Handled notification button ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
}

// Autocomplete interactions

let transformedCourses: [string, string][] | null = null;
let transformedProfessors: [string, string][] | null = null;
let transformedCourseRoles: [string, string][] | null = null;
let transformedQuestions: [string, string][] | null = null;
let transformedSessions: [string, string][] | null = null;
let transformedClassrooms: [string, string][] | null = null;

async function handleCourseAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  if (transformedCourses === null) {
    transformedCourses = Object.entries(transformOptions(getCourses()));
  }

  await interaction.respond(createOptions(transformedCourses, interaction.options.getFocused()));
}

async function handleProfessorAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  if (transformedProfessors === null) {
    transformedProfessors = Object.entries(transformOptions(getStaff().map((p) => p.name)));
  }

  await interaction.respond(createOptions(transformedProfessors, interaction.options.getFocused()));
}

async function handleCourseRoleAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  if (transformedCourseRoles === null) {
    transformedCourseRoles = Object.entries(transformOptions(Object.values(getFromRoleConfig('courses'))));
  }

  await interaction.respond(createOptions(transformedCourseRoles, interaction.options.getFocused()));
}

async function handleQuestionAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  if (transformedQuestions === null) {
    transformedQuestions = Object.entries(transformOptions(getAllQuestions()));
  }

  await interaction.respond(createOptions(transformedQuestions, interaction.options.getFocused()));
}

async function handleSessionAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  if (transformedSessions === null) {
    transformedSessions = Object.entries(transformOptions(Object.keys(getSessions())));
  }

  await interaction.respond(createOptions(transformedSessions, interaction.options.getFocused()));
}

async function handleClassroomAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  if (transformedClassrooms === null) {
    transformedClassrooms = Object.entries(transformOptions(getClassrooms().map((c) => c.classroom.toString())));
  }

  await interaction.respond(createOptions(transformedClassrooms, interaction.options.getFocused()));
}
