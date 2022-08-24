import { ChannelType, ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { setTimeout } from 'timers/promises';
import { client } from '../src/client.js';
import { getFromConfig } from '../src/config.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Purge last N messages')
  .addNumberOption(option => option
    .setName('count')
    .setDescription('Number of messages to purge')
    .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const count = interaction.options.getNumber('count') ?? 0;

  if (count < 1) {
    await interaction.editReply('You must specify a positive number of messages to purge.');
  }

  const guild = client.guilds.cache.get(getFromConfig('server'));
  if (guild === undefined) {
    return;
  }

  const member = guild.members.cache.get(interaction.user.id);
  if (!member?.permissions.has(PermissionsBitField.Flags.Administrator) && !member?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await interaction.editReply('No permission!');
  }

  await interaction.editReply(`Deleting last ${count} messages...`);
  await setTimeout(1000);
  await interaction.deleteReply();

  if (interaction.channel?.type === ChannelType.GuildText) {
    await interaction.channel.bulkDelete(count);
  }
}
