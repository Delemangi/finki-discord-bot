import { toggleCrossposting } from '../utils/crossposting.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js';

const name = 'crosspost';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator | PermissionsBitField.Flags.ManageMessages);

export async function execute (interaction: ChatInputCommandInteraction) {
  const permissions = interaction.member?.permissions as PermissionsBitField;
  if (!permissions.has(PermissionsBitField.Flags.Administrator) && !permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await interaction.editReply('Оваа команда е само за администратори.');
    return;
  }

  await interaction.editReply(`Crossposting е ${toggleCrossposting() ? 'вклучено' : 'исклучено'}.`);
}
