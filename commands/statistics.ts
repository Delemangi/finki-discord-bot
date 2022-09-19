import {
  type ChatInputCommandInteraction,
  type Role,
  SlashCommandBuilder,
  roleMention
} from 'discord.js';
import { getFromRoleConfig } from '../utils/config.js';
import { isTextGuildBased } from '../utils/functions.js';

export const data = new SlashCommandBuilder()
  .setName('statistics')
  .setDescription('Color')
  .addSubcommand((command) => command
    .setName('color')
    .setDescription('Get the number of members for each color'));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild;
  const colorRoles = getFromRoleConfig('color');

  if (!isTextGuildBased(interaction.channel) || guild === null) {
    await interaction.editReply('You cannot use this command here.');
    return;
  }

  await guild.members.fetch();

  const roles = colorRoles.map((role) => guild.roles.cache.find((r) => r.name === role)) as Role[];
  const output = roles.sort((a, b) => b.members.size - a.members.size).map((role) => `${roleMention(role.id)}: ${role.members.size}`);

  await interaction.editReply({
    allowedMentions: { parse: [] },
    content: output.join('\n')
  });
}
