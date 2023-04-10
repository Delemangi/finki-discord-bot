import { sendEmbed } from '../utils/channels.js';
import { getCommands } from '../utils/commands.js';
import {
  getApplicationId,
  getFromRoleConfig,
  getToken,
} from '../utils/config.js';
import {
  getColorsComponents,
  getColorsEmbed,
  getCoursesAddComponents,
  getCoursesAddEmbed,
  getCoursesComponents,
  getCoursesEmbed,
  getCoursesRemoveComponents,
  getCoursesRemoveEmbed,
  getNotificationsComponents,
  getNotificationsEmbed,
  getProgramsComponents,
  getProgramsEmbed,
  getRulesEmbed,
  getVipRequestComponents,
  getVipRequestEmbed,
  getYearsComponents,
  getYearsEmbed,
} from '../utils/embeds.js';
import { logger } from '../utils/logger.js';
import { commands, errors } from '../utils/strings.js';
import {
  type Channel,
  type ChatInputCommandInteraction,
  type GuildTextBasedChannel,
  PermissionFlagsBits,
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'script';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Script')
  .addSubcommand((command) =>
    command
      .setName('courses')
      .setDescription(commands['script courses'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName('rolesets')
          .setDescription('Сетови на улоги')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('colors')
      .setDescription(commands['script colors'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('image').setDescription('Слика').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('notifications')
      .setDescription(commands['script notifications'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('programs')
      .setDescription(commands['script programs'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('years')
      .setDescription(commands['script years'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName('newlines')
          .setDescription('Број на празни редови')
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('rules')
      .setDescription(commands['script rules'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command.setName('register').setDescription(commands['script register']),
  )
  .addSubcommand((command) =>
    command
      .setName('vip')
      .setDescription(commands['script vip'])
      .addChannelOption((option) =>
        option.setName('channel').setDescription('Канал').setRequired(true),
      ),
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const handleScriptCourses = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const newlines = interaction.options.getNumber('newlines') ?? 0;
  const roleSets = interaction.options.getString('rolesets')?.split(',') ?? [];

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply('Само текст канали се дозволени.');
  }

  for (const roleSet of roleSets.length === 0 ? '12345678' : roleSets) {
    const roles = getFromRoleConfig('course')[roleSet];

    if (roles === undefined) {
      await interaction.editReply('Невалиден сет на улоги.');
      return;
    }

    const embed = getCoursesEmbed(roleSet, roles);
    const components = getCoursesComponents(roles);
    try {
      await sendEmbed(
        channel as GuildTextBasedChannel,
        embed,
        components,
        Number(newlines),
      );
      await interaction.editReply('Успешно испратено.');
    } catch (error) {
      await interaction.editReply('Испраќањето беше неуспешно.');
      logger.error(`Couldn't send embed\n${error}`);
      return;
    }
  }

  const addEmbed = getCoursesAddEmbed();
  const addComponents = getCoursesAddComponents(
    roleSets.length === 0 ? Array.from('12345678') : roleSets,
  );
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      addEmbed,
      addComponents,
      Number(newlines),
    );
    await interaction.editReply('Успешно испратено.');
  } catch (error) {
    await interaction.editReply('Испраќањето беше неуспешно.');
    logger.error(`Couldn't send embed\n${error}`);
    return;
  }

  const removeEmbed = getCoursesRemoveEmbed();
  const removeComponents = getCoursesRemoveComponents(
    roleSets.length === 0 ? Array.from('12345678') : roleSets,
  );
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      removeEmbed,
      removeComponents,
      Number(newlines),
    );
    await interaction.editReply('Успешно испратено.');
  } catch (error) {
    await interaction.editReply('Испраќањето беше неуспешно.');
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptColors = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const image = interaction.options.getString('image', true);
  const newlines = interaction.options.getNumber('newlines') ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply('Само текст канали се дозволени.');
  }

  const embed = getColorsEmbed(image);
  const components = getColorsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines),
    );
    await interaction.editReply('Успешно испратено.');
  } catch (error) {
    await interaction.editReply('Испраќањето беше неуспешно.');
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptNotifications = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const newlines = interaction.options.getNumber('newlines') ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply('Само текст канали се дозволени.');
  }

  const embed = getNotificationsEmbed();
  const components = getNotificationsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines),
    );
    await interaction.editReply('Успешно испратено.');
  } catch (error) {
    await interaction.editReply('Испраќањето беше неуспешно.');
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptPrograms = async (
  interaction: ChatInputCommandInteraction,
) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const newlines = interaction.options.getNumber('newlines') ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply('Само текст канали се дозволени.');
  }

  const embed = getProgramsEmbed();
  const components = getProgramsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      components,
      Number(newlines),
    );
    await interaction.editReply('Успешно испратено.');
  } catch (error) {
    await interaction.editReply('Испраќањето беше неуспешно.');
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptYears = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;
  const newlines = interaction.options.getNumber('newlines') ?? 0;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply('Само текст канали се дозволени.');
  }

  const embed = getYearsEmbed();
  const components = getYearsComponents();
  try {
    await sendEmbed(
      channel as GuildTextBasedChannel,
      embed,
      [components],
      Number(newlines),
    );
    await interaction.editReply('Успешно испратено.');
  } catch (error) {
    await interaction.editReply('Испраќањето беше неуспешно.');
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptRegister = async (
  interaction: ChatInputCommandInteraction,
) => {
  const rest = new REST().setToken(getToken());
  const commandsToRegister = [];

  for (const [, command] of await getCommands()) {
    commandsToRegister.push(command.data.toJSON());
  }

  try {
    await rest.put(Routes.applicationCommands(getApplicationId()), {
      body: commandsToRegister,
    });
    await interaction.editReply('Командите се успешно синхронизирани.');
  } catch (error) {
    await interaction.editReply('Синхронизацијата беше неуспешна.');
    logger.error(`Couldn't register commands\n${error}`);
  }
};

const handleScriptRules = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply('Само текст канали се дозволени.');
  }

  const embed = getRulesEmbed();
  try {
    await (channel as GuildTextBasedChannel).send({
      embeds: [embed],
    });
    await interaction.editReply('Успешно испратено.');
  } catch (error) {
    await interaction.editReply('Испраќањето беше неуспешно.');
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const handleScriptVip = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel('channel', true) as Channel;

  if (!channel.isTextBased() || channel.isDMBased()) {
    await interaction.editReply('Само текст канали се дозволени.');
  }

  const embed = getVipRequestEmbed();
  const components = getVipRequestComponents();
  try {
    await (channel as GuildTextBasedChannel).send({
      components,
      embeds: [embed],
    });
    await interaction.editReply('Успешно испратено.');
  } catch (error) {
    await interaction.editReply('Испраќањето беше неуспешно.');
    logger.error(`Couldn't send embed\n${error}`);
  }
};

const listHandlers = {
  colors: handleScriptColors,
  courses: handleScriptCourses,
  notifications: handleScriptNotifications,
  programs: handleScriptPrograms,
  register: handleScriptRegister,
  rules: handleScriptRules,
  vip: handleScriptVip,
  years: handleScriptYears,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const permissions = interaction.member?.permissions as
    | PermissionsBitField
    | undefined;
  if (
    permissions === undefined ||
    !permissions.has(PermissionsBitField.Flags.Administrator)
  ) {
    await interaction.editReply(errors.adminOnlyCommand);
    return;
  }

  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(listHandlers).includes(subcommand)) {
    await listHandlers[subcommand as keyof typeof listHandlers](interaction);
  }
};
