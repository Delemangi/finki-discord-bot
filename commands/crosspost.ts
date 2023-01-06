import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionsBitField
} from 'discord.js';
import { toggleCrossposting } from '../utils/crossposting.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'crosspost';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const permissions = interaction.member?.permissions as PermissionsBitField;
  if (!permissions.has(PermissionsBitField.Flags.Administrator) && !permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await interaction.editReply('Оваа команда е само за администратори.');
    return;
  }

  await interaction.editReply(`Crossposting е ${toggleCrossposting() ? 'вклучено' : 'исклучено'}.`);
}
