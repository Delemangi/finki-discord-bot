import { getClassroomEmbed } from '../../components/commands.js';
import { getClassrooms } from '../../configuration/files.js';
import { type Command } from '../../lib/types/Command.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../../translations/commands.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export const getCommonCommand = (
  name: keyof typeof commandDescriptions,
): Command => ({
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription(commandDescriptions[name])
    .addStringOption((option) =>
      option
        .setName('classroom')
        .setDescription('Просторија')
        .setRequired(true)
        .setAutocomplete(true),
    ),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const classroom = interaction.options.getString('classroom', true);
    const charPos = classroom.indexOf('(');
    const classroomName =
      charPos === -1 ? classroom : classroom.slice(0, charPos).trim();
    const classrooms = getClassrooms().filter(
      (cl) =>
        cl.classroom.toString().toLowerCase() === classroomName.toLowerCase(),
    );

    if (classrooms.length === 0) {
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
  },
});
