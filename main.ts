import { readdirSync } from 'node:fs';
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
  userMention
} from 'discord.js';
import Keyv from 'keyv';
import { client } from './utils/client.js';
import {
  getCourses,
  getFromBotConfig,
  getFromRoleConfig,
  getStaff
} from './utils/config.js';
import {
  checkConfig,
  isTextGuildBased
} from './utils/functions.js';
import { logger } from './utils/logger.js';

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

let logTextChannel: TextChannel;
let colorRoles: Role[] = [];
let yearRoles: Role[] = [];
let programRoles: Role[] = [];
const ignoredButtonIDs = ['help'];

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
  if (!crosspostChannels.length || !crosspostChannels.includes(message.channel.id)) {
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
  logger.info('Bot is ready');

  const channel = client.channels.cache.get(logChannel);

  if (!channel || channel?.type !== ChannelType.GuildText) {
    throw new Error('The log channel must be a guild text channel');
  }

  logTextChannel = channel;
});

try {
  await client.login(token);
  logger.info('Bot logged in');
} catch (error) {
  throw new Error(`Bot failed to login\n${error}`);
}

async function handleChatInputCommand (interaction: ChatInputCommandInteraction): Promise<void> {
  const command = commands.get(interaction.commandName);

  if (!command) {
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

  if (!command) {
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
  } else {
    logger.warn(`Received unknown autocomplete interaction ${interaction.id} from ${interaction.user.id}: ${interaction.commandName}, option ${option.name}`);
  }
}

async function handleColorButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (!guild) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  if (!colorRoles.length) {
    const roles = getFromRoleConfig('color').map((r) => guild.roles.cache.find((ro) => ro.name === r));

    if (!roles || roles.includes(undefined)) {
      logger.warn(`One or more roles for button interaction ${interaction.id}: ${interaction.customId} were not found`);
      return;
    }

    colorRoles = roles as Role[];
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (!role) {
    logger.warn(`The role for button interaction ${interaction.id}: ${interaction.customId} was not found `);
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

  if (!guild) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  if (!yearRoles.length) {
    const roles = getFromRoleConfig('year').map((r) => guild.roles.cache.find((ro) => ro.name === r));

    if (!roles || roles.includes(undefined)) {
      logger.warn(`One or more roles for button interaction ${interaction.id}: ${interaction.customId} were not found`);
      return;
    }

    yearRoles = roles as Role[];
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (!role) {
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

  if (!guild) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (!role) {
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

  if (!guild) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (!role) {
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

  if (!guild) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const poll = await keyv.get(interaction.message.id);

  const hasVoted = poll.participants.find((person: { id: string }) => person.id === interaction.user.id);
  const newIndex = Number(interaction.customId.split(':')[1]);
  let newVotes = poll.votes;
  const newOptionVotes = poll.optionVotes;
  const newParticipants = poll.participants;
  const userIndex = poll.participants.findIndex((person: { id: string }) => person.id === interaction.user.id);
  let replyMessage: string;

  if (hasVoted && poll.participants[userIndex].vote === newIndex) {
    newVotes -= 1;
    newOptionVotes[newIndex] -= 1;
    newParticipants.splice(userIndex, 1);

    replyMessage = 'Го тргнавте вашиот глас.';
  } else if (hasVoted) {
    newOptionVotes[poll.participants[userIndex].vote] -= 1;
    newOptionVotes[newIndex] += 1;
    newParticipants[userIndex].vote = newIndex;

    replyMessage = `Ја променивте вашата опција во опцијата: ${Number(args[0]) + 1}.`;
  } else {
    newOptionVotes[newIndex] += 1;
    newParticipants.push({
      id: interaction.user.id,
      vote: newIndex
    });
    newVotes += 1;

    replyMessage = `Гласавте и ја одбравте опцијата: ${Number(args[0]) + 1}.`;
  }

  await keyv.set(interaction.message.id, {
    options: poll.options,
    optionVotes: newOptionVotes,
    participants: newParticipants,
    title: poll.title,
    votes: newVotes
  });

  await interaction.reply({
    content: replyMessage,
    ephemeral: true
  });

  const updatedPoll = await keyv.get(interaction.message.id);

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(updatedPoll.title)
    .setDescription(updatedPoll.options.map((option: any, index: any) => `${index + 1}. ${option} - \`[${updatedPoll.votes > 0 ? generatePercentageBar((updatedPoll.optionVotes[index] / updatedPoll.votes) * 100) : generatePercentageBar(0)}]\` **(${updatedPoll.votes > 0 ? (updatedPoll.optionVotes[index] / updatedPoll.votes) * 100 : '0'}%)**`).join('\n'))
    .setTimestamp();

  await interaction.message.edit({ embeds: [embed] });
}

function generatePercentageBar(percentage: number) {
  if(percentage === 0)
    return '.'.repeat(20);

  return '█'.repeat(percentage / 5) + '▌'.repeat((percentage % 5) / 2.5);
}

async function handleProgramButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (!guild) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  if (!programRoles.length) {
    const roles = getFromRoleConfig('program').map((r) => guild.roles.cache.find((ro) => ro.name === r));

    if (!roles || roles.includes(undefined)) {
      logger.warn(`One or more roles for button interaction ${interaction.id}: ${interaction.customId} were not found`);
      return;
    }

    programRoles = roles as Role[];
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (!role) {
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

  if (!guild) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (!role) {
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

async function handleCourseAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  const course = interaction.options.getFocused().toLowerCase();

  await interaction.respond(
    getCourses()
      .filter((c) => c.toLowerCase().includes(course))
      .map((c) => ({
        name: c,
        value: c
      })).slice(0, 25)
  );
}

async function handleProfessorAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  const professor = interaction.options.getFocused().toLowerCase();

  await interaction.respond(
    getStaff()
      .filter((p) => p.name.toLowerCase().includes(professor))
      .map((p) => ({
        name: p.name,
        value: p.name
      })).slice(0, 25)
  );
}

async function handleCourseRoleAutocomplete (interaction: AutocompleteInteraction): Promise<void> {
  const course = interaction.options.getFocused().toLowerCase();

  await interaction.respond(
    Object.entries(getFromRoleConfig('courses'))
      .filter(([, c]) => c.toLowerCase().includes(course))
      .map(([, c]) => ({
        name: c,
        value: c
      })).slice(0, 25)
  );
}
