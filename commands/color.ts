import { ChatInputCommandInteraction, Role, SlashCommandBuilder } from 'discord.js';
import { getFromRoleConfig } from '../src/config.js';

export const data = new SlashCommandBuilder()
  .setName('color')
  .setDescription('Color')
  .addSubcommand(command => command
    .setName('statistics')
    .setDescription('Get color statistics'));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild;
  const colorRoles = getFromRoleConfig('color');

  if (guild === null) {
    interaction.editReply('You can only use this command in a server.');
    return;
  }

  await guild.members.fetch();

  const roles = colorRoles.map(role => guild.roles.cache.find(r => r.name === role)) as Role[];
  const output = roles.map(role => `${role.name}: ${role.members.size}`);

  // @ts-ignore
  output.sort((a, b) => parseInt(b.split(':')[1].trim()) - parseInt(a.split(':')[1].trim()));

  await interaction.editReply(output.join('\n'));
}
