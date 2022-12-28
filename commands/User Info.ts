import {
  type GuildMember,
  type UserContextMenuCommandInteraction,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  time,
  TimestampStyles
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { isTextGuildBased } from '../utils/functions.js';

export const data = new ContextMenuCommandBuilder()
  .setName('User Info')
  .setType(ApplicationCommandType.User);

export async function execute (interaction: UserContextMenuCommandInteraction): Promise<void> {
  const member = interaction.targetMember as GuildMember;

  if (!isTextGuildBased(interaction.channel) || interaction.guild === null) {
    await interaction.editReply('Оваа команда се повикува само во сервер.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setAuthor({
      iconURL: member.displayAvatarURL(),
      name: member.user.tag
    })
    .setTitle('Информации за корисникот')
    .addFields(
      {
        inline: true,
        name: 'Регистриран',
        value: time(member.user.createdAt, TimestampStyles.RelativeTime)
      },
      {
        inline: true,
        name: 'Додаден во серверот',
        value: time(member.joinedAt ?? new Date(), TimestampStyles.RelativeTime)
      }
    );

  await interaction.editReply({ embeds: [embed] });
}
