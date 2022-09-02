import {
  type ChatInputCommandInteraction,
  type TextChannel,
  ChannelType,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { logger } from '../src/logger.js';

export const data = new SlashCommandBuilder()
  .setName('embed')
  .setDescription('Interact with embeds')
  .addSubcommand((command) => command
    .setName('create')
    .setDescription('Create an embed')
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
      .setRequired(false)))
  .addSubcommand((command) => command
    .setName('edit')
    .setDescription('Edit an existing embed')
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('The channel of the embed')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('id')
      .setDescription('The ID of the message')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('json')
      .setDescription('Embed JSON')
      .setRequired(true))
    .addBooleanOption((option) => option
      .setName('timestamp')
      .setDescription('Whether to add a timestamp to the embed')
      .setRequired(false)))
  .addSubcommand((command) => command
    .setName('delete')
    .setDescription('Delete an existing embed')
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('The channel of the embed')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('id')
      .setDescription('The ID of the message')
      .setRequired(true)));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const subcommand = interaction.options.getSubcommand();
  const channel = interaction.options.getChannel('channel') ?? '';

  if (channel === undefined || channel === '' || channel.type !== ChannelType.GuildText) {
    await interaction.editReply('Invalid channel provided.');
    return;
  }

  if (subcommand === 'create') {
    let json;
    try {
      json = JSON.parse(interaction.options.getString('json') ?? '');
    } catch {
      await interaction.editReply('Invalid JSON provided.');
      return;
    }

    const timestamp = interaction.options.getBoolean('timestamp') ?? true;

    const embed = EmbedBuilder.from(json);

    if (timestamp) {
      embed.setTimestamp();
    }

    try {
      if (json.color !== undefined) {
        embed.setColor(json.color);
      }
    } catch (error) {
      logger.error(`Failed to set color\n${error}`);

      await interaction.editReply('Invalid color provided.');
      return;
    }

    try {
      await (channel as TextChannel).send({ embeds: [embed] });

      await interaction.editReply('Embed sent.');
    } catch (error) {
      logger.error(`Error sending embed\n${error}`);

      await interaction.editReply('Couldn\'t send embed..');
    }
  } else if (subcommand === 'edit') {
    const id = interaction.options.getString('id') ?? '';
    const json = JSON.parse(interaction.options.getString('json') ?? '');
    const timestamp = interaction.options.getBoolean('timestamp') ?? true;

    if (json === undefined) {
      await interaction.editReply('Invalid JSON provided.');
      return;
    }

    const embed = EmbedBuilder.from(json);

    if (timestamp) {
      embed.setTimestamp();
    }

    try {
      if (json.color !== undefined) {
        embed.setColor(json.color);
      }
    } catch (error) {
      logger.error(`Failed to set color\n${error}`);

      await interaction.editReply('Invalid color provided.');
      return;
    }

    try {
      const message = await (channel as TextChannel).messages.fetch(id);
      await message.edit({ embeds: [embed] });

      await interaction.editReply('Embed updated.');
    } catch (error) {
      logger.error(`Error editing embed\n${error}`);

      await interaction.editReply('Invalid JSON provided or the message is not in the provided channel.');
    }
  } else {
    const id = interaction.options.getString('id') ?? '';

    try {
      const message = await (channel as TextChannel).messages.fetch(id);
      await message.delete();

      await interaction.editReply('Embed deleted.');
    } catch (error) {
      logger.error(`Error deleting embed\n${error}`);

      await interaction.editReply('Invalid message ID provided or the message is not in the provided channel.');
    }
  }
}
