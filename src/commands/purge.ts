import { commands, errors } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';

const name = 'purge';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .addNumberOption((option) =>
    option
      .setName('count')
      .setDescription('Број на пораки (меѓу 1 и 100)')
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true),
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const permissions = interaction.member?.permissions as
    | PermissionsBitField
    | undefined;
  if (
    permissions === undefined ||
    !permissions.has(PermissionsBitField.Flags.ManageMessages)
  ) {
    await interaction.editReply(errors.adminOnlyCommand);
    return;
  }

  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    await interaction.editReply(errors.serverOnlyCommand);
    return;
  }

  const count = Math.round(interaction.options.getNumber('count', true));

  await interaction.editReply(`Бришам ${count} пораки...`);
  await setTimeout(500);
  await interaction.deleteReply();
  await interaction.channel?.bulkDelete(count);
};
