import { commandErrors, commandResponses } from '../translations/commands.js';
import { getConfigProperty } from '../utils/config.js';
import { getMemberFromGuild } from '../utils/guild.js';
import { getOrCreateWebhookByChannelId } from '../utils/webhooks.js';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

const name = 'Star';

export const data = new ContextMenuCommandBuilder()
  .setName(name)
  .setType(ApplicationCommandType.Message)
  .setDMPermission(false);

export const execute = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  const webhooksChannel = await getConfigProperty('starboard');
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
    content: message?.content ?? '',
    files: message?.attachments.map((attachment) => attachment.url) ?? [],
    username: member.displayName,
  });

  await interaction.editReply(commandResponses.messageStarred);
};
