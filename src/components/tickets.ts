import { emojis } from '../translations/emojis.js';
import { labels } from '../translations/labels.js';
import { type TicketType } from '../types/TicketType.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const getTicketCreateComponents = (ticketTypes: TicketType[]) => {
  const components = [];

  for (let index1 = 0; index1 < ticketTypes.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      const ticketType = ticketTypes[index2];

      if (ticketType === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`ticketCreate:${ticketType.id}`)
        .setLabel(ticketType.name)
        .setStyle(ButtonStyle.Success)
        .setEmoji(emojis[(index2 + 1).toString()] ?? '🔒');

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getTicketCloseComponents = (ticketId: string) => {
  const row = new ActionRowBuilder<ButtonBuilder>();
  const button = new ButtonBuilder()
    .setCustomId(`ticketClose:${ticketId}`)
    .setLabel(labels.close)
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🔒');

  row.addComponents(button);

  return [row];
};
