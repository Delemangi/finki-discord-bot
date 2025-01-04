import { getChannelsProperty } from '../configuration/main.js';
import { Channel } from '../lib/schemas/Channel.js';
import {
  commandDescriptions,
  commandErrors,
  commandResponses,
} from '../translations/commands.js';
import { labels } from '../translations/labels.js';
import { safeReplyToInteraction } from '../utils/messages.js';
import { getActiveTickets } from '../utils/tickets.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'ticket';
const dateFormatter = Intl.DateTimeFormat('mk-MK', {
  dateStyle: 'long',
  timeStyle: 'short',
});

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Ticket')
  .addSubcommand((command) =>
    command
      .setName('close')
      .setDescription(commandDescriptions['ticket close']),
  )
  .addSubcommand((command) =>
    command.setName('list').setDescription(commandDescriptions['ticket list']),
  );

const handleTicketClose = async (interaction: ChatInputCommandInteraction) => {
  const ticketsChannel = await getChannelsProperty(Channel.Tickets);

  if (
    !interaction.channel?.isThread() ||
    interaction.channel.parentId !== ticketsChannel
  ) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  await interaction.editReply(commandResponses.ticketClosed);

  await interaction.channel.setLocked(true);
  await interaction.channel.setArchived(true);
};

const handleTicketList = async (interaction: ChatInputCommandInteraction) => {
  const ticketThreads = await getActiveTickets(interaction);

  if (ticketThreads === undefined || ticketThreads.size === 0) {
    await interaction.editReply(commandErrors.noTickets);

    return;
  }

  ticketThreads.sort((a, b) => {
    if (!a.createdTimestamp || !b.createdTimestamp) {
      return 0;
    }

    if (a.createdTimestamp < b.createdTimestamp) {
      return -1;
    }

    if (a.createdTimestamp > b.createdTimestamp) {
      return 1;
    }

    return 0;
  });

  const threadLinks = ticketThreads
    .map(
      (thread) =>
        `- ${thread.url} (${thread.createdAt ? dateFormatter.format(thread.createdAt) : labels.none})`,
    )
    .join('\n');

  await safeReplyToInteraction(interaction, threadLinks);
};

const ticketHandlers = {
  close: handleTicketClose,
  list: handleTicketList,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand in ticketHandlers) {
    await ticketHandlers[subcommand as keyof typeof ticketHandlers](
      interaction,
    );
  }
};
