import {
  commandDescriptions,
  commandErrors,
  commandResponses,
} from '../translations/commands.js';
import { getChannelProperty } from '../utils/config.js';
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'ticket';

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
  const ticketsChannel = await getChannelProperty('tickets');

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
  const ticketsChannel = await getChannelProperty('tickets');

  const threads = interaction.guild?.channels.cache.filter(
    (channel) =>
      channel.isThread() &&
      channel.parentId === ticketsChannel &&
      !channel.archived &&
      !channel.locked,
  );

  if (threads === undefined) {
    await interaction.editReply(commandErrors.noTickets);

    return;
  }

  const threadLinks = threads.map((thread) => '- ' + thread.url).join('\n');

  await interaction.editReply(threadLinks);
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
