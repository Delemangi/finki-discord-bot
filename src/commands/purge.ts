import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';

import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';

const name = 'purge';
const permission = PermissionFlagsBits.ManageMessages;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addNumberOption((option) =>
    option
      .setName('count')
      .setDescription('Број на пораки (меѓу 1 и 100)')
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true),
  )
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(permission);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  if (
    interaction.channel === null ||
    !interaction.channel.isTextBased() ||
    interaction.channel.isDMBased()
  ) {
    await interaction.editReply(commandErrors.serverOnlyCommand);

    return;
  }

  const count = Math.round(interaction.options.getNumber('count', true));

  await interaction.editReply(commandResponseFunctions.deletingMessages(count));
  await setTimeout(500);
  await interaction.deleteReply();
  await interaction.channel.bulkDelete(count, true);
};
