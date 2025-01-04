import { getChannelsProperty } from '../configuration/main.js';
import {
  commandErrors,
  commandResponseFunctions,
} from '../translations/commands.js';
import { labels } from '../translations/labels.js';
import { Channel } from '../types/schemas/Channel.js';
import { getMemberFromGuild } from '../utils/guild.js';
import { getOrCreateWebhookByChannelId } from '../utils/webhooks.js';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  InteractionContextType,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

const name = 'Star';

export const data = new ContextMenuCommandBuilder()
  .setName(name)
  .setType(ApplicationCommandType.Message)
  .setContexts(InteractionContextType.Guild);

export const execute = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  const webhooksChannel = await getChannelsProperty(Channel.Starboard);

  if (webhooksChannel === undefined) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  const webhook = await getOrCreateWebhookByChannelId(webhooksChannel);
  const message = await interaction.channel?.messages.fetch(
    interaction.targetId,
  );
  const member = await getMemberFromGuild(
    message?.author.id ?? '',
    interaction,
  );

  if (member === null) {
    await interaction.editReply(commandErrors.memberNotFound);

    return;
  }

  await webhook?.send({
    avatarURL: member.displayAvatarURL(),
    content: `${message?.content}\n\n${labels.link}: ${message?.url}`,
    files: message?.attachments.map((attachment) => attachment.url) ?? [],
    username: member.displayName,
  });

  await interaction.editReply(
    commandResponseFunctions.messageStarred(message?.url ?? labels.unknown),
  );
};
