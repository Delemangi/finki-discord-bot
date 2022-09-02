import {
  type ChatInputCommandInteraction,
  type Role,
  roleMention,
  SlashCommandBuilder,
  ChannelType
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('participants')
  .setDescription('Participants')
  .addSubcommand((command) => command
    .setName('role')
    .setDescription('Get the number of participants of a role')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('Role')
      .setRequired(true)));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const guild = interaction.guild;
  const role = interaction.options.getRole('role') as Role;

  if (guild === null || interaction.channel === null || interaction.channel.type !== ChannelType.GuildText) {
    await interaction.editReply('You cannot use this command here.');
    return;
  }

  await guild.members.fetch();

  await interaction.editReply({
    allowedMentions: { parse: [] },
    content: `${roleMention(role.id)}: ${role.members.size}`
  });
}
