import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { client } from '../utils/client.js';
import { getFromBotConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { CommandsDescription as commands } from '../utils/strings.js';

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

const command = 'help';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(commands[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  await client.application?.commands.fetch();

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle('Команди')
    .addFields(...Object.entries(commands).slice(0, commandsPerPage).map(([name, description]) => ({
      name: `</${name}:${client.application?.commands.cache.find((c) => c.name === name.split(' ').at(0))?.id}>`,
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

    const id = buttonInteraction.customId.split(':')[1];

    if (id === undefined) {
      return;
    }

    let buttons: ActionRowBuilder<ButtonBuilder>;
    let page = Number(buttonInteraction.message.embeds[0]?.footer?.text?.split(' / ')[0]) - 1;

    if (id === 'first') {
      page = 0;
    } else if (id === 'last') {
      page = pages - 1;
    } else if (id === 'previous') {
      page--;
    } else if (id === 'next') {
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
      .addFields(...Object.entries(commands).slice(commandsPerPage * page, commandsPerPage * (page + 1)).map(([name, description]) => ({
        name: `</${name}:${client.application?.commands.cache.find((c) => c.name === name.split(' ').at(0))?.id}>`,
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
