import {
  getCoursesPrerequisiteEmbed,
  getCoursesProgramEmbed,
} from "@app/components/commands.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from "@app/strings/commands.js";
import { programMapping } from "@app/strings/programs.js";
import { type ProgramName } from "@app/types/ProgramName.js";
import { createPollChoices } from "@app/utils/polls.js";
import { getCourseRolesBySemester } from "@app/utils/roles.js";
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  SlashCommandBuilder,
} from "discord.js";

const name = "courses";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Get all...")
  .addSubcommand((command) =>
    command
      .setName("program")
      .setDescription(commandDescriptions["courses program"])
      .addStringOption((option) =>
        option
          .setName("program")
          .setDescription("Смер")
          .setRequired(true)
          .addChoices(...createPollChoices(Object.keys(programMapping))),
      )
      .addNumberOption((option) =>
        option
          .setName("semester")
          .setDescription("Семестар")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(8),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("prerequisite")
      .setDescription(commandDescriptions["courses prerequisite"])
      .addStringOption((option) =>
        option
          .setName("course")
          .setDescription("Курс")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("add")
      .setDescription(commandDescriptions["courses add"])
      .addNumberOption((option) =>
        option
          .setName("semester")
          .setDescription("Семестар")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(8),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("remove")
      .setDescription(commandDescriptions["courses remove"])
      .addNumberOption((option) =>
        option
          .setName("semester")
          .setDescription("Семестар")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(8),
      ),
  );

const handleCoursesProgram = async (
  interaction: ChatInputCommandInteraction,
) => {
  const program = interaction.options.getString("program", true) as ProgramName;
  const semester = interaction.options.getNumber("semester", true);

  const embeds = await getCoursesProgramEmbed(program, semester);
  await interaction.editReply({
    embeds,
  });
};

const handleCoursesPrerequisite = async (
  interaction: ChatInputCommandInteraction,
) => {
  const course = interaction.options.getString("course", true);

  const embed = await getCoursesPrerequisiteEmbed(course);
  await interaction.editReply({
    embeds: [embed],
  });
};

const handleCoursesAdd = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.guild === null) {
    await interaction.editReply(commandErrors.serverOnlyCommand);

    return;
  }

  const semester = interaction.options.getNumber("semester", true);
  const member = interaction.member as GuildMember;
  const roles = getCourseRolesBySemester(interaction.guild, semester);

  await member.roles.add(roles);
  await interaction.editReply(
    commandResponseFunctions.semesterCoursesAdded(semester),
  );
};

const handleCoursesRemove = async (
  interaction: ChatInputCommandInteraction,
) => {
  if (interaction.guild === null) {
    await interaction.editReply(commandErrors.serverOnlyCommand);

    return;
  }

  const semester = interaction.options.getNumber("semester", true);
  const member = interaction.member as GuildMember;
  const roles = getCourseRolesBySemester(interaction.guild, semester);

  await member.roles.remove(roles);
  await interaction.editReply(
    commandResponseFunctions.semesterCoursesRemoved(semester),
  );
};

const coursesHandlers = {
  add: handleCoursesAdd,
  prerequisite: handleCoursesPrerequisite,
  program: handleCoursesProgram,
  remove: handleCoursesRemove,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(coursesHandlers).includes(subcommand)) {
    await coursesHandlers[subcommand as keyof typeof coursesHandlers](
      interaction,
    );
  }
};
