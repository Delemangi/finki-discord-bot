import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  userMention,
} from 'discord.js';

import { getClassroomEmbed } from '../../components/commands.js';
import { getClassrooms } from '../../configuration/files.js';
import { type Command } from '../../lib/types/Command.js';
import {
  commandDescriptions,
  commandErrors,
} from '../../translations/commands.js';

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
    )
    .addUserOption((option) =>
      option.setName('user').setDescription('Корисник').setRequired(false),
    ),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const classroom = interaction.options.getString('classroom', true);
    const user = interaction.options.getUser('user');

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

    const embeds = classrooms.map((cl) => getClassroomEmbed(cl));
    await interaction.editReply({
      content: user ? userMention(user.id) : null,
      embeds,
    });
  },
});
