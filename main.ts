import { readdirSync } from 'node:fs';
import { REST } from '@discordjs/rest';
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type GuildMemberRoleManager,
  type Role,
  type TextChannel,
  type UserContextMenuCommandInteraction,
  channelMention,
  ChannelType,
  Collection,
  EmbedBuilder,
  inlineCode,
  roleMention,
  Routes,
  userMention
} from 'discord.js';
import { client } from './utils/client.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getSubject
} from './utils/config.js';
import { logger } from './utils/logger.js';

const applicationID = getFromBotConfig('applicationID');
const token = getFromBotConfig('token');
const logChannel = getFromBotConfig('logChannel');
const color = getFromBotConfig('color');
const crosspostChannels = getFromBotConfig('crosspostChannels');

if (applicationID === undefined || applicationID === '') {
  throw new Error('Missing application ID');
}

if (token === undefined || token === '') {
  throw new Error('Missing token');
}

if (logChannel === undefined || logChannel === '') {
  throw new Error('Missing log channel');
}

// @ts-expect-error This could happen if the property is empty
if (color === undefined || color === '') {
  throw new Error('Missing color');
}

const rest = new REST().setToken(token);

const files = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));
const commands = new Collection<string, Command>();
const commandsJSON: string[] = [];

for (const file of files) {
  const command: Command = await import(`./commands/${file}`);
  commands.set(command.data.name, command);
  commandsJSON.push(command.data.toJSON());

  logger.debug(`Command: ${command.data.name}`);
}

try {
  await rest.put(Routes.applicationCommands(applicationID), { body: commandsJSON });
  logger.debug('Successfully registered application commands');
} catch (error) {
  throw new Error(`Failed to register application commands\n${error}`);
}

let logTextChannel: TextChannel;
let colorRoles: Role[] = [];
let yearRoles: Role[] = [];
let programRoles: Role[] = [];

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    logger.debug(`Handling chat input command interaction ${interaction.id} from ${interaction.user.id}: ${interaction}`);
    await handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    logger.debug(`Handling button interaction ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
    await handleButton(interaction);
  } else if (interaction.isUserContextMenuCommand()) {
    logger.debug(`Handling user context menu interaction ${interaction.id} from ${interaction.user.id}: ${interaction.commandName} ${interaction.targetId}`);
    await handleUserContextMenuCommand(interaction);
  } else {
    logger.warn(`Received unknown interaction ${interaction.id} from ${interaction.user.id}: ${interaction.toJSON()}`);
  }
});

client.on('messageCreate', async (message) => {
  if (crosspostChannels === undefined || !crosspostChannels.includes(message.channel.id)) {
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

  if (channel === undefined || channel?.type !== ChannelType.GuildText) {
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

  if (command === undefined) {
    logger.warn(`No command was found for the chat command ${interaction.id}: ${interaction.commandName}`);
    return;
  }

  logger.debug(`Received chat input command interaction ${interaction.id} from ${interaction.user.tag}: ${interaction}`);
  logger.info(`[Chat] ${interaction.user.tag}: ${interaction} [${interaction.channel?.type === ChannelType.GuildText ? 'Guild' : 'DM'}]`);

  try {
    await interaction.deferReply();
    await command.execute(interaction);
    logger.debug(`Handled interaction ${interaction.id} from ${interaction.user.id}: ${interaction}`);
  } catch (error) {
    logger.error(`Failed to handle interaction\n${error}`);
  }

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
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

  logger.info(`[Button] ${interaction.user.tag}: ${interaction.customId} [${interaction.channel?.type === ChannelType.GuildText ? 'Guild' : 'DM'}]`);

  if (command === 'color') {
    await handleColorButton(interaction, args);
  } else if (command === 'year') {
    await handleYearButton(interaction, args);
  } else if (command === 'activity') {
    await handleActivityButton(interaction, args);
  } else if (command === 'subject') {
    await handleSubjectButton(interaction, args);
  } else if (command === 'program') {
    await handleProgramButton(interaction, args);
  } else if (command === 'notification') {
    await handleNotificationButton(interaction, args);
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

  logger.info(`[User Context Menu] ${interaction.user.tag}: ${interaction.commandName} [${interaction.channel?.type === ChannelType.GuildText ? 'Guild' : 'DM'}]`);

  try {
    await interaction.deferReply();
    await command.execute(interaction);
    logger.debug(`Handled interaction ${interaction.id} from ${interaction.user.id}: ${interaction.commandName} ${interaction.targetId}`);
  } catch (error) {
    logger.error(`Failed to handle interaction\n${error}`);
  }

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
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

async function handleColorButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  if (colorRoles.length === 0) {
    const roles = getFromRoleConfig('color').map((r) => guild.roles.cache.find((ro) => ro.name === r));

    if (roles === undefined || roles.includes(undefined)) {
      logger.warn(`One or more roles for button interaction ${interaction.id}: ${interaction.customId} were not found`);
      return;
    }

    colorRoles = roles as Role[];
  }

  const role = guild.roles.cache.find((r) => r.name === args[0]);
  const member = interaction.member;

  if (role === undefined) {
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

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
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

    if (roles === undefined || roles.includes(undefined)) {
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

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
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

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
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

async function handleSubjectButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
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
      content: `Го ${removed ? 'отстранивте' : 'земавте'} предметот ${inlineCode(getSubject(role.name))}.`,
      ephemeral: true
    });
  } catch (error) {
    logger.warn(`Failed to respond to button interaction ${interaction.id}: ${interaction.customId}\n${error}`);
    return;
  }

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
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
          value: 'Subject'
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

  logger.debug(`Handled subject button ${interaction.id} from ${interaction.user.id}: ${interaction.customId}`);
}

async function handleProgramButton (interaction: ButtonInteraction, args: string[]): Promise<void> {
  const guild = interaction.guild;

  if (guild === null) {
    logger.warn(`Received button interaction ${interaction.id}: ${interaction.customId} from ${interaction.user.tag} outside of a guild`);
    return;
  }

  if (programRoles.length === 0) {
    const roles = getFromRoleConfig('program').map((r) => guild.roles.cache.find((ro) => ro.name === r));

    if (roles === undefined || roles.includes(undefined)) {
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

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
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

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
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
