import {
  type ChatInputCommandInteraction,
  type GuildMember,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';

import {
  commandDescriptions,
  commandResponses,
} from '../translations/commands.js';

const name = 'timeout';
const options = [
  {
    name: '1 мин.',
    value: '60000',
  },
  {
    name: '5 мин.',
    value: '300000',
  },
  {
    name: '15 мин.',
    value: '900000',
  },
  {
    name: '30 мин.',
    value: '1800000',
  },
  {
    name: '1 ч.',
    value: '3600000',
  },
  {
    name: '24 ч.',
    value: '86400000',
  },
];

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addStringOption((option) =>
    option
      .setName('duration')
      .setDescription('Времетраење')
      .setRequired(true)
      .setChoices(options),
  )
  .setContexts(InteractionContextType.Guild);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const member = interaction.member as GuildMember;
  const duration = interaction.options.getString('duration', true);

  const timeoutDuration = Number.parseInt(duration);

  try {
    await member.timeout(timeoutDuration);
  } catch {
    await interaction.editReply(commandResponses.timeoutImpossible);
    return;
  }

  await interaction.editReply(commandResponses.timeoutSet);
};
