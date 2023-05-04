import { Reminder } from '../entities/Reminder.js';
import { saveReminder } from '../utils/database.js';
import { commandDescriptions } from '../utils/strings.js';
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
    await interaction.editReply('Невалидна дата или време.');
  }

  const reminder = new Reminder();
  reminder.description = description;
  reminder.date = date;
  reminder.owner = interaction.user.id;

  if (interaction.channel === null || interaction.channel.isDMBased()) {
    reminder.private = true;
  } else {
    reminder.private = false;
    reminder.channel = interaction.channel.id;
  }

  await saveReminder(reminder);

  await interaction.editReply(`Креиран е потсетник за ${time(date, 'F')}.`);
};
