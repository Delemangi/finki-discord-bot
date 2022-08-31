import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder, GuildMember, time, TimestampStyles, UserContextMenuCommandInteraction } from 'discord.js';

export const data = new ContextMenuCommandBuilder()
  .setName('User Info')
  .setType(ApplicationCommandType.User);

export async function execute (interaction: UserContextMenuCommandInteraction): Promise<void> {
  const member = interaction.targetMember as GuildMember;

  if (member === null) {
    await interaction.editReply('This should never happen. Report it to the developer.');
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.displayAvatarURL() })
    .setTitle('User Info')
    .addFields(
      { name: 'Created At', value: time(member.user.createdAt, TimestampStyles.RelativeTime), inline: true },
      { name: 'Joined At', value: time(member.joinedAt ?? new Date(), TimestampStyles.RelativeTime), inline: true }
    );

  await interaction.editReply({ embeds: [embed] });
}
