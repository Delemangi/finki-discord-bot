import { getClassroomEmbed } from '../components/commands.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import { type Command } from '../types/Command.js';
import { getClassrooms } from '../utils/config.js';
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
    const [classroomName] = classroom.split(' ');
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
  },
});
