import {
  getCoursesPrerequisiteEmbed,
  getCoursesProgramEmbed,
} from '../utils/embeds.js';
import { commands, programMapping } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'courses';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Get all...')
  .addSubcommand((command) =>
    command
      .setName('program')
      .setDescription(commands['courses programs'])
      .addStringOption((option) =>
        option
          .setName('program')
          .setDescription('Смер')
          .setRequired(true)
          .addChoices(
            ...Object.keys(programMapping).map((program) => ({
              name: program,
              value: program,
            })),
          ),
      )
      .addNumberOption((option) =>
        option
          .setName('semester')
          .setDescription('Семестар')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(8),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName('prerequisite')
      .setDescription(commands['courses prerequisite'])
      .addStringOption((option) =>
        option
          .setName('course')
          .setDescription('Курс')
          .setRequired(true)
          .setAutocomplete(true),
      ),
  );

const handleCoursesProgram = async (
  interaction: ChatInputCommandInteraction,
) => {
  const program = interaction.options.getString('program', true) as ProgramKeys;
  const semester = interaction.options.getNumber('semester', true);

  const embeds = getCoursesProgramEmbed(program, semester);
  await interaction.editReply({ embeds });
};

const handleCoursesPrerequisite = async (
  interaction: ChatInputCommandInteraction,
) => {
  const course = interaction.options.getString('course', true);

  const embed = getCoursesPrerequisiteEmbed(course);
  await interaction.editReply({ embeds: [embed] });
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand === 'program') {
    await handleCoursesProgram(interaction);
  } else if (subcommand === 'prerequisite') {
    await handleCoursesPrerequisite(interaction);
  }
};
