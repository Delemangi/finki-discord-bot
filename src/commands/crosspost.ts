import { toggleCrossposting } from '../utils/crossposting.js';
import { commandDescriptions } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'crosspost';
const permission = PermissionFlagsBits.ManageMessages;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .setDefaultMemberPermissions(permission);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.editReply(
    `Crossposting е сега ${toggleCrossposting() ? 'вклучено' : 'исклучено'}.`,
  );
};
