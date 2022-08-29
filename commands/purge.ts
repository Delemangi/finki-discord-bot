import { ChannelType, ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { setTimeout } from 'timers/promises';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Purge last N messages')
  .addNumberOption(option => option
    .setName('count')
    .setDescription('Number of messages to purge')
    .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  if (interaction.channel?.type !== ChannelType.GuildText) {
    await interaction.editReply('You can only use this command in a server.');
    return;
  }

  const count = interaction.options.getNumber('count') ?? 0;

  if (count < 1) {
    await interaction.editReply('You must specify a positive number of messages to purge.');
  }

  const guild = interaction.guild;
  if (guild === null) {
    return;
  }

  const member = interaction.member;
  const permissions = member?.permissions as PermissionsBitField;
  if (!permissions.has(PermissionsBitField.Flags.Administrator) && !permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await interaction.editReply('No permission!');
  }

  await interaction.editReply(`Deleting last ${count} messages...`);
  await setTimeout(1000);
  await interaction.deleteReply();

  await interaction.channel.bulkDelete(count);
}
