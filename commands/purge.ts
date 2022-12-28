import { setTimeout } from 'node:timers/promises';
import {
  type ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js';
import { isTextGuildBased } from '../utils/functions.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'purge';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command])
  .addNumberOption((option) => option
    .setName('count')
    .setDescription('Number of messages to purge')
    .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const channel = interaction.channel;

  if (!isTextGuildBased(channel) || interaction.guild === null) {
    await interaction.editReply('Оваа команда се повикува само во сервер.');
    return;
  }

  const count = interaction.options.getNumber('count') ?? 0;

  if (count < 1) {
    await interaction.editReply('Невалиден број на пораки за бришење.');
    return;
  }

  const permissions = interaction.member?.permissions as PermissionsBitField;
  if (!permissions.has(PermissionsBitField.Flags.Administrator) && !permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await interaction.editReply('Оваа команда е само за администратори.');
    return;
  }

  await interaction.editReply(`Бришам ${count} пораки...`);
  await setTimeout(1_000);
  await interaction.deleteReply();
  await channel?.bulkDelete(count);
}
