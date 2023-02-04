import { getFromBotConfig } from '../utils/config.js';
import { commands } from '../utils/strings.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';

const name = 'quiz';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name]);

export async function execute (interaction: ChatInputCommandInteraction) {
  const components = [];
  const row = new ActionRowBuilder<ButtonBuilder>();
  const buttons = [];

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
    .setDescription('Добредојдовте на квизот.\nДали сакате да започнете?')
    .setTimestamp()
    .setFooter({ text: 'Кој Сака Да Биде Морален Победник? © 2022' });

  await interaction.editReply({
    components,
    embeds: [embed]
  });
}
