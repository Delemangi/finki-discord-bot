import {
  getCoursesPrerequisiteEmbed,
  getCoursesProgramEmbed,
} from "../components/commands.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from "../translations/commands.js";
import { programMapping } from "../translations/programs.js";
import { type ProgramName } from "../types/ProgramName.js";
import { getGuild } from "../utils/guild.js";
import { createPollChoices } from "../utils/polls.js";
import { getCourseRolesBySemester } from "../utils/roles.js";
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
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const semester = interaction.options.getNumber("semester", true);
  const member = interaction.member as GuildMember;
  const roles = getCourseRolesBySemester(guild, semester);

  await member.roles.add(roles);
  await interaction.editReply(
    commandResponseFunctions.semesterCoursesAdded(semester),
  );
};

const handleCoursesRemove = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const semester = interaction.options.getNumber("semester", true);
  const member = interaction.member as GuildMember;
  const roles = getCourseRolesBySemester(guild, semester);

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

  if (subcommand in coursesHandlers) {
    await coursesHandlers[subcommand as keyof typeof coursesHandlers](
      interaction,
    );
  }
};
