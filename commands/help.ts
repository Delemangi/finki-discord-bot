import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { commands } from '../utils/strings.js';

const pages = Math.ceil(Object.keys(commands).length / 8);

const command = 'help';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(commands[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Commands')
    .addFields(...Object.entries(commands).slice(0, 8).map(([name, description]) => ({
      name,
      value: description
    })))
    .setFooter({ text: `1 / ${pages}` });

  const buttons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help:first')
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('help:previous')
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('help:next')
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('help:last')
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Primary)
    );

  const message = await interaction.editReply({
    components: [buttons],
    embeds: [embed]
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    idle: 30_000
  });

  collector.on('collect', async (buttonInteraction) => {
    if (buttonInteraction.user.id !== buttonInteraction.message.interaction?.user.id) {
      await buttonInteraction.reply({
        content: 'Ова не е ваша команда.',
        ephemeral: true
      });
      return;
    }

    const id = buttonInteraction.customId.split(':')[1];

    if (id === undefined) {
      return;
    }

    let page = Number(buttonInteraction.message.embeds[0]?.footer?.text?.split(' / ')[0]) - 1;

    if (id === 'first') {
      page = 0;
    } else if (id === 'last') {
      page = Math.floor(Object.keys(commands).length / 8);
    } else if (id === 'previous' && page !== 0) {
      page--;
    } else if (id === 'next' && page !== pages - 1) {
      page++;
    }

    const nextEmbed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Commands')
      .addFields(...Object.entries(commands).slice(8 * page, 8 * (page + 1)).map(([name, description]) => ({
        name,
        value: description
      })))
      .setFooter({ text: `${page + 1} / ${pages}` });

    await buttonInteraction.update({
      components: [buttons],
      embeds: [nextEmbed]
    });
  });

  collector.on('end', async () => {
    await message.edit({
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.components.map((button) => button.setDisabled(true)))],
      embeds: [embed]
    });
  });
}
