import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import {
  commandDescriptions,
  commandResponses,
} from '../translations/commands.js';
import { getAdByName, getAdsOptions } from '../utils/ads.js';

const name = 'ad';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Ad')
  .addSubcommand((command) =>
    command
      .setName('send')
      .setDescription(commandDescriptions['ad send'])
      .addStringOption((option) =>
        option
          .setName('ad')
          .setDescription('Реклама')
          .setRequired(true)
          .addChoices(getAdsOptions()),
      ),
  );

const handleAdSend = async (interaction: ChatInputCommandInteraction) => {
  const adName = interaction.options.getString('ad', true);
  const { job } = getAdByName(adName);

  await job?.trigger();

  await interaction.editReply(commandResponses.adSent);
};

const adHandlers = {
  send: handleAdSend,
};

export const execute = async (
  interaction: ChatInputCommandInteraction,
): Promise<void> => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand in adHandlers) {
    await adHandlers[subcommand as keyof typeof adHandlers](interaction);
  }
};
