import { commandErrors } from '../translations/commands.js';
import { getExperienceFromMessage } from '../utils/experience.js';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

const name = 'Get Experience';

export const data = new ContextMenuCommandBuilder()
  .setName(name)
  .setType(ApplicationCommandType.Message);

export const execute = async (
  interaction: UserContextMenuCommandInteraction,
) => {
  const message = await interaction.channel?.messages.fetch(
    interaction.targetId,
  );

  if (message === undefined) {
    await interaction.editReply(commandErrors.commandError);

    return;
  }

  const experience = await getExperienceFromMessage(message);

  await interaction.editReply(`${message.url}: ${experience.toString()}`);
};
