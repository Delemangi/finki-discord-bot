import { REST } from '@discordjs/rest';
import { ButtonInteraction, channelMention, ChannelType, ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMemberRoleManager, inlineCode, Role, roleMention, Routes, TextChannel, userMention } from 'discord.js';
import { getFromConfig } from './src/config.js';
import { readdirSync } from 'fs';
import { logger } from './src/logger.js';
import { client } from './src/client.js';

const [applicationID, token] = [getFromConfig('applicationID'), getFromConfig('token')];

if (applicationID === undefined || token === undefined) {
  throw new Error('Missing applicationID or token');
}

const rest = new REST().setToken(token);

const files = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));
const commands = new Collection<string, Command>();
const commandsJSON: string[] = [];

for (const file of files) {
  const command: Command = await import(`./commands/${file}`);
  commands.set(command.data.name, command);
  commandsJSON.push(command.data.toJSON());
}

try {
  await rest.put(Routes.applicationCommands(applicationID), { body: commandsJSON });
} catch (error) {
  logger.error(`Failed to register application commands: ${error}`);
}

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    await handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    await handleButton(interaction);
  } else {
    logger.warn(`Unhandled interaction: ${interaction}`);
  }
});

let logChannel: TextChannel;

client.once('ready', async () => {
  logger.info('Bot is ready!');

  const channel = client.channels.cache.get(getFromConfig('logChannel'));

  if (channel?.type !== ChannelType.GuildText) {
    throw new Error('Provided log channel is not a guild text channel.');
  }

  logChannel = channel;
});

try {
  await client.login(token);
} catch (error) {
  logger.error(`Failed to login to Discord: ${error}`);
}

async function handleChatInputCommand (interaction: ChatInputCommandInteraction) {
  const command = commands.get(interaction.commandName);

  if (!command) return;

  logger.info(`[Chat] ${interaction.user.tag}: ${interaction}`);

  try {
    await interaction.deferReply();
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Failed to handle interaction: ${error}`);
  }

  if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
    const embed = new EmbedBuilder()
      .setTitle('Chat')
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .addFields(
        { name: 'Author', value: userMention(interaction.user.id) },
        { name: 'Command', value: inlineCode(interaction.toString()) },
        { name: 'Channel', value: channelMention(interaction.channel.id) }
      )
      .setFooter({ text: interaction.id })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  }
}

let colorRoles: Role[] = [];

async function handleButton (interaction: ButtonInteraction) {
  const [command, ...args] = interaction.customId.split(':');
  const guild = interaction.guild;

  logger.info(`[Button] ${interaction.user.tag}: ${interaction.customId}`);

  if (guild === null) {
    return;
  }

  if (command === 'color') {
    if (colorRoles.length === 0) {
      colorRoles = getFromConfig('colorRoles').map(r => guild.roles.cache.find(ro => ro.name === r)) as Role[];
    }

    const role = guild.roles.cache.find(r => r.name === args[0]);
    const member = interaction.member;

    if (role === undefined || member === null) {
      return;
    }

    const memberRoles = (member.roles as GuildMemberRoleManager);

    await memberRoles.remove(colorRoles);
    await memberRoles.add(role);

    await interaction.deferUpdate();

    if (interaction.channel !== null && interaction.channel.type === ChannelType.GuildText) {
      const embed = new EmbedBuilder()
        .setTitle('Button')
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .addFields(
          { name: 'Author', value: userMention(interaction.user.id) },
          { name: 'Command', value: 'Color' },
          { name: 'Role', value: roleMention(role.id) },
        )
        .setFooter({ text: interaction.id })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    }
  }
}
