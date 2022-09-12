import { setTimeout } from 'node:timers/promises';
import {
  type ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js';
import { isTextGuildBased } from '../utils/functions.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Purge last N messages')
  .addNumberOption((option) => option
    .setName('count')
    .setDescription('Number of messages to purge')
    .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const channel = interaction.channel;

  if (!isTextGuildBased(channel) || interaction.guild === null) {
    await interaction.editReply('You cannot use this command here.');
    return;
  }

  const count = interaction.options.getNumber('count') ?? 0;

  if (count < 1) {
    await interaction.editReply('You must specify a positive number of messages to purge.');
    return;
  }

  const permissions = interaction.member?.permissions as PermissionsBitField;
  if (!permissions.has(PermissionsBitField.Flags.Administrator) && !permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await interaction.editReply('You cannot run this command.');
    return;
  }

  await interaction.editReply(`Deleting the last ${count} message(s)...`);
  await setTimeout(1_000);
  await interaction.deleteReply();
  await channel?.bulkDelete(count);
}
