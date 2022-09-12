import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { isTextGuildBased } from '../utils/functions.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('embed')
  .setDescription('Interact with embeds')
  .addChannelOption((option) => option
    .setName('channel')
    .setDescription('The channel to send the embed to')
    .setRequired(true))
  .addStringOption((option) => option
    .setName('json')
    .setDescription('Embed JSON')
    .setRequired(true))
  .addBooleanOption((option) => option
    .setName('timestamp')
    .setDescription('Whether to add a timestamp to the embed')
    .setRequired(false));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const channel = interaction.options.getChannel('channel', true);
  const json = interaction.options.getString('json', true);
  const timestamp = interaction.options.getBoolean('timestamp') ?? false;

  if (!isTextGuildBased(channel)) {
    await interaction.editReply('Invalid channel provided.');
    return;
  }

  const parsed = JSON.parse(json);
  const embed = EmbedBuilder.from(parsed);

  if (timestamp) {
    embed.setTimestamp();
  }

  try {
    if (parsed.color !== undefined) {
      embed.setColor(parsed.color);
    }
  } catch (error) {
    logger.error(`Failed to set color\n${error}`);

    await interaction.editReply('Invalid color provided.');
    return;
  }

  try {
    await channel.send({ embeds: [embed] });

    await interaction.editReply('Embed sent.');
  } catch (error) {
    logger.error(`Error sending embed\n${error}`);

    await interaction.editReply('Couldn\'t send embed..');
  }
}
