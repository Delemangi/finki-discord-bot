import { getSessions } from '../configuration/files.js';
import {
  commandDescriptions,
  commandErrors,
} from '../translations/commands.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { access } from 'fs/promises';

const name = 'session';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addStringOption((option) =>
    option
      .setName('session')
      .setDescription('Сесија')
      .setRequired(true)
      .setAutocomplete(true),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const session = interaction.options.getString('session', true);
  const information = Object.entries(getSessions()).find(
    ([key]) => key.toLowerCase() === session.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(commandErrors.sessionNotFound);

    return;
  }

  const path = `./sessions/${information[1]}`;

  try {
    await access(path);
  } catch {
    await interaction.editReply(commandErrors.sessionNotFound);

    return;
  }

  await interaction.editReply({
    content: information[0],
    files: [path],
  });
};
