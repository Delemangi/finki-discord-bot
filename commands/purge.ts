import { setTimeout } from 'node:timers/promises';
import {
  type ChatInputCommandInteraction,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Purge last N messages')
  .addNumberOption((option) => option
    .setName('count')
    .setDescription('Number of messages to purge')
    .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  if (interaction.guild === null || interaction.channel === null || interaction.channel?.type !== ChannelType.GuildText) {
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

  await interaction.editReply(`Deleting last ${count} messages...`);
  await setTimeout(1_000);
  await interaction.deleteReply();
  await interaction.channel.bulkDelete(count);
}
