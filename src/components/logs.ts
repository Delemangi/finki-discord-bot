import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  inlineCode,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
  userMention,
} from 'discord.js';

import { getThemeColor } from '../configuration/main.js';
import { embedLabels } from '../translations/embeds.js';
import {
  fetchMessageUrl,
  getButtonCommand,
  getButtonInfo,
  getChannelMention,
} from './utils.js';

export const getChatInputCommandEmbed = async (
  interaction: ChatInputCommandInteraction,
) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(embedLabels.chatInputInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        inline: true,
        name: embedLabels.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: embedLabels.channel,
        value: getChannelMention(interaction),
      },
      {
        inline: true,
        name: embedLabels.command,
        value: inlineCode(
          interaction.toString().length > 300
            ? interaction.toString().slice(0, 300)
            : interaction.toString(),
        ),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();

export const getUserContextMenuCommandEmbed = async (
  interaction: UserContextMenuCommandInteraction,
) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(embedLabels.userContextMenuInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        name: embedLabels.author,
        value: userMention(interaction.user.id),
      },
      {
        name: embedLabels.channel,
        value: getChannelMention(interaction),
      },
      {
        name: embedLabels.command,
        value: inlineCode(interaction.commandName),
      },
      {
        name: embedLabels.target,
        value: userMention(interaction.targetUser.id),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();

export const getMessageContextMenuCommandEmbed = async (
  interaction: MessageContextMenuCommandInteraction,
) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(embedLabels.messageContextMenuInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
      ...(await fetchMessageUrl(interaction)),
    })
    .addFields(
      {
        name: embedLabels.author,
        value: userMention(interaction.user.id),
      },
      {
        name: embedLabels.channel,
        value: getChannelMention(interaction),
      },
      {
        name: embedLabels.command,
        value: inlineCode(interaction.commandName),
      },
      {
        name: embedLabels.target,
        value: inlineCode(interaction.targetId),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();

export const getButtonEmbed = (
  interaction: ButtonInteraction,
  command = 'unknown',
  args: string[] = [],
) =>
  new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(embedLabels.buttonInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: embedLabels.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: embedLabels.channel,
        value: getChannelMention(interaction),
      },
      {
        inline: true,
        name: embedLabels.command,
        value: getButtonCommand(command),
      },
      {
        inline: true,
        ...getButtonInfo(interaction, command, args),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();

export const getAutocompleteEmbed = (interaction: AutocompleteInteraction) => {
  const focused = interaction.options.getFocused(true);

  return new EmbedBuilder()
    .setColor(getThemeColor())
    .setTitle(embedLabels.autocompleteInteraction)
    .setAuthor({
      iconURL: interaction.user.displayAvatarURL(),
      name: interaction.user.tag,
    })
    .addFields(
      {
        inline: true,
        name: embedLabels.author,
        value: userMention(interaction.user.id),
      },
      {
        inline: true,
        name: embedLabels.channel,
        value: getChannelMention(interaction),
      },
      {
        inline: true,
        name: embedLabels.command,
        value: inlineCode(focused.name),
      },
      {
        inline: true,
        name: embedLabels.value,
        value:
          focused.value === '' ? embedLabels.empty : inlineCode(focused.value),
      },
    )
    .setFooter({
      text: interaction.id,
    })
    .setTimestamp();
};
