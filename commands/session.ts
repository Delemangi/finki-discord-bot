import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import { getSessions } from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'session';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command])
  .addStringOption((option) => option
    .setName('session')
    .setDescription('Сесија')
    .setRequired(true)
    .setAutocomplete(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const session = interaction.options.getString('session', true);
  const information = getSessions()[session];

  if (information === undefined) {
    await interaction.editReply('Не постои таа сесија.');
    return;
  }

  await interaction.editReply({
    content: `Сесија: ${session}`,
    files: [`./sessions/${information}`]
  });
}
