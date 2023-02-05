import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';

const name = 'purge';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .addNumberOption((option) => option
    .setName('count')
    .setDescription('Number of messages to purge')
    .setRequired(true))
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute (interaction: ChatInputCommandInteraction) {
  const permissions = interaction.member?.permissions as PermissionsBitField | undefined;
  if (permissions === undefined || !permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await interaction.editReply('Оваа команда е само за администратори.');
    return;
  }

  if (interaction.channel === null || !interaction.channel.isTextBased() || interaction.channel.isDMBased()) {
    await interaction.editReply('Оваа команда се повикува само во сервер.');
    return;
  }

  const count = interaction.options.getNumber('count', true);

  if (count < 1) {
    await interaction.editReply('Невалиден број на пораки за бришење.');
    return;
  }

  await interaction.editReply(`Бришам ${count} пораки...`);
  await setTimeout(1_000);
  await interaction.deleteReply();
  await interaction.channel?.bulkDelete(count);
}
