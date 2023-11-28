import { getClassroomEmbed } from "@app/components/commands.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from "@app/translations/commands.js";
import { getClassrooms } from "@app/utils/config.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "classroom";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addStringOption((option) =>
    option
      .setName("classroom")
      .setDescription("Просторија")
      .setRequired(true)
      .setAutocomplete(true),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const classroom = interaction.options.getString("classroom", true);
  const [classroomName] = classroom.split(" ");
  const classrooms = getClassrooms().filter(
    (cl) =>
      cl.classroom.toString().toLowerCase() === classroomName?.toLowerCase(),
  );

  if (classrooms.length === 0 || classroomName === undefined) {
    await interaction.editReply({
      content: commandErrors.classroomNotFound,
    });

    return;
  }

  const embeds = await Promise.all(
    classrooms.map(async (cl) => await getClassroomEmbed(cl)),
  );
  await interaction.editReply({
    embeds,
    ...(embeds.length > 1
      ? {
          content: commandResponseFunctions.multipleClassrooms(classroomName),
        }
      : {}),
  });
};
