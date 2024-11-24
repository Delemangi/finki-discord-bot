import { type PaginationPosition } from '../types/interfaces/PaginationPosition.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const getPaginationComponents = (
  name: string,
  position: PaginationPosition = 'none',
) => {
  if (position === 'none') {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${name}:first`)
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:previous`)
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:next`)
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:last`)
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
    );
  }

  if (position === 'start') {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${name}:first`)
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:previous`)
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:next`)
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:last`)
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Primary),
    );
  } else if (position === 'middle') {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${name}:first`)
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:previous`)
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:next`)
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:last`)
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Primary),
    );
  } else {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${name}:first`)
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:previous`)
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${name}:next`)
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`${name}:last`)
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
    );
  }
};
