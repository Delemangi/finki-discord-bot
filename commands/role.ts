import { ChatInputCommandInteraction, Role, roleMention, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('participants')
  .setDescription('Participants')
  .addSubcommand(command => command
    .setName('role')
    .setDescription('Get the number of participants of a role')
    .addRoleOption(option => option
      .setName('role')
      .setDescription('Role')
      .setRequired(true)));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild;
  const role = interaction.options.getRole('role') as Role;

  if (guild === null) {
    await interaction.editReply('You can only use this command in a server.');
    return;
  }

  await guild.members.fetch();

  await interaction.editReply({ content: `${roleMention(role.id)}: ${role.members.size}`, allowedMentions: { parse: [] } });
}
