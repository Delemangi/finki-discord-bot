import { toggleCrossposting } from '../utils/crossposting.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  type PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'crosspost';
const permission = PermissionFlagsBits.ManageMessages;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name])
  .setDefaultMemberPermissions(permission);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const permissions = interaction.member?.permissions as
    | PermissionsBitField
    | undefined;
  if (permissions === undefined || !permissions.has(permission)) {
    await interaction.editReply('Оваа команда е само за администратори.');
    return;
  }

  await interaction.editReply(
    `Crossposting е сега ${toggleCrossposting() ? 'вклучено' : 'исклучено'}.`,
  );
};
