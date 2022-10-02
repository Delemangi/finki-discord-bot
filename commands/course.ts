import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  roleMention
} from 'discord.js';
import {
  getFromBotConfig,
  getFromRoleConfig,
  getParticipants,
  getProfessors
} from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

export const data = new SlashCommandBuilder()
  .setName('course')
  .setDescription('Course')
  .addSubcommand((command) => command
    .setName('participants')
    .setDescription(CommandsDescription['course participants'])
    .addStringOption((option) => option
      .setName('course')
      .setDescription('Course to get the participants for')
      .setRequired(true)
      .setAutocomplete(true)))
  .addSubcommand((command) => command
    .setName('professors')
    .setDescription(CommandsDescription['course professors'])
    .addStringOption((option) => option
      .setName('course')
      .setDescription('Course to get the professors for')
      .setRequired(true)
      .setAutocomplete(true)))
  .addSubcommand((command) => command
    .setName('role')
    .setDescription(CommandsDescription['course role'])
    .addStringOption((option) => option
      .setName('courserole')
      .setDescription('Course to get the role participants for')
      .setRequired(true)
      .setAutocomplete(true)));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const course = interaction.options.getString('course');
  const courserole = interaction.options.getString('courserole');

  if (interaction.options.getSubcommand(true) === 'participants') {
    const information = getParticipants().find((p) => p.course === course);

    if (information === undefined) {
      await interaction.editReply('Не постои таков предмет.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(course)
      .addFields(...Object.entries(information).filter(([year]) => year !== 'course').map(([year, participants]) => ({
        inline: true,
        name: year,
        value: participants.toString()
      })))
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } else if (interaction.options.getSubcommand(true) === 'professors') {
    const information = getProfessors().find((p) => p.course === course);

    if (information === undefined) {
      await interaction.editReply('Не постои таков предмет.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(course)
      .addFields({
        inline: true,
        name: 'Професори',
        value: information.professors === '' ? '?' : information.professors ?? '?'
      },
      {
        inline: true,
        name: 'Асистенти',
        value: information.assistants === '' ? '?' : information.assistants ?? '?'
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } else {
    if (interaction.guild === null) {
      await interaction.editReply('Оваа команда се повикува само во сервер.');
      return;
    }

    await interaction.guild.members.fetch();

    const roleEntry = Object.entries(getFromRoleConfig('courses')).find(([, c]) => c === courserole);

    if (roleEntry === undefined) {
      await interaction.editReply('Не постои таков предмет.');
      return;
    }

    const role = interaction.guild.roles.cache.find((r) => r.name === roleEntry[0]);

    if (role === undefined) {
      await interaction.editReply('Не постои таков предмет.');
      return;
    }

    await interaction.editReply({
      allowedMentions: { parse: [] },
      content: `${roleMention(role.id)}: ${role.members.size}`
    });
  }
}

