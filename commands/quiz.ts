import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  userMention
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'quiz';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  const row = new ActionRowBuilder<ButtonBuilder>();
  const buttons: ButtonBuilder[] = [];

  buttons.push(new ButtonBuilder()
    .setCustomId(`quiz:${interaction.user.id}:y`)
    .setLabel('Да')
    .setStyle(ButtonStyle.Primary));

  buttons.push(new ButtonBuilder()
    .setCustomId(`quiz:${interaction.user.id}:n`)
    .setLabel('Не')
    .setStyle(ButtonStyle.Danger));

  buttons.push(new ButtonBuilder()
    .setCustomId(`quiz:${interaction.user.id}:h`)
    .setLabel('Помош за квизот')
    .setStyle(ButtonStyle.Secondary));

  row.addComponents(buttons);
  components.push(row);

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Кој сака да биде морален победник?')
    .setDescription('Добредојдовте во квизот на ФИНКИ Discord серверот.\nДали сакате да започнете?')
    .setTimestamp()
    .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2022' });

  await interaction.editReply({
    components,
    content: userMention(interaction.user.id),
    embeds: [embed]
  });
}
