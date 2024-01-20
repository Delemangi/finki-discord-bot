import { createReminder } from '../data/Reminder.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import { parseDate } from 'chrono-node';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  time,
} from 'discord.js';

const name = 'reminder';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addStringOption((option) =>
    option.setName('description').setDescription('Опис').setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('when')
      .setDescription('Датум и/или време')
      .setRequired(true),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const description = interaction.options.getString('description', true);
  const when = interaction.options.getString('when', true);

  const date = parseDate(when);

  if (date === null || date === undefined) {
    await interaction.editReply(commandErrors.invalidDateTime);

    return;
  }

  await createReminder({
    channelId: interaction.channelId,
    description,
    privateMessage:
      interaction.channel === null || interaction.channel.isDMBased(),
    timestamp: date,
    userId: interaction.user.id,
  });

  await interaction.editReply(
    commandResponseFunctions.reminderCreated(time(date, 'F'), description),
  );
};
