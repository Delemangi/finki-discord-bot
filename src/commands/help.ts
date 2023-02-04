import { client } from '../utils/client.js';
import { getFromBotConfig } from '../utils/config.js';
import { commandMention } from '../utils/functions.js';
import { logger } from '../utils/logger.js';
import { commands } from '../utils/strings.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';

const name = 'help';
const commandsPerPage = 8;
const pages = Math.ceil(Object.keys(commands).length / commandsPerPage);
const middleButtons = new ActionRowBuilder<ButtonBuilder>()
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
const startButtons = new ActionRowBuilder<ButtonBuilder>()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('help:first')
      .setEmoji('⏪')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('help:previous')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('help:next')
      .setEmoji('➡️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('help:last')
      .setEmoji('⏩')
      .setStyle(ButtonStyle.Primary)
  );
const endButtons = new ActionRowBuilder<ButtonBuilder>()
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
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('help:last')
      .setEmoji('⏩')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true)
  );
const disabledButtons = new ActionRowBuilder<ButtonBuilder>()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('help:first')
      .setEmoji('⏪')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('help:previous')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('help:next')
      .setEmoji('➡️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('help:last')
      .setEmoji('⏩')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true)
  );

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commands[name]);

export async function execute (interaction: ChatInputCommandInteraction) {
  await client.application?.commands.fetch();

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Команди')
    .addFields(...Object.entries(commands).slice(0, commandsPerPage).map(([command, description]) => ({
      name: commandMention(command),
      value: description
    })))
    .setFooter({ text: `1 / ${pages}` });

  const message = await interaction.editReply({
    components: [startButtons],
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

    const ID = buttonInteraction.customId.split(':')[1];

    if (ID === undefined) {
      return;
    }

    let buttons;
    let page = Number(buttonInteraction.message.embeds[0]?.footer?.text?.split(' / ')[0]) - 1;

    if (ID === 'first') {
      page = 0;
    } else if (ID === 'last') {
      page = pages - 1;
    } else if (ID === 'previous') {
      page--;
    } else if (ID === 'next') {
      page++;
    }

    if (page === 0) {
      buttons = startButtons;
    } else if (page === pages - 1) {
      buttons = endButtons;
    } else {
      buttons = middleButtons;
    }

    const nextEmbed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle('Команди')
      .addFields(...Object.entries(commands).slice(commandsPerPage * page, commandsPerPage * (page + 1)).map(([command, description]) => ({
        name: commandMention(command),
        value: description
      })))
      .setFooter({ text: `${page + 1} / ${pages}` });

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed]
      });
    } catch (error) {
      logger.error(`Failed to update help command\n${error}`);
    }
  });

  collector.on('end', async () => {
    try {
      if (message.editable) {
        await message.edit({
          components: [disabledButtons],
          embeds: [embed]
        });
      }
    } catch (error) {
      logger.error(`Failed to end help command\n${error}`);
    }
  });
}
