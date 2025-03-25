import {
  type ChatInputCommandInteraction,
  ComponentType,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { client } from '../client.js';
import { getHelpEmbed } from '../components/commands.js';
import { getPaginationComponents } from '../components/pagination.js';
import { getIntervalsProperty } from '../configuration/main.js';
import { logger } from '../logger.js';
import {
  commandDescriptions,
  commandErrors,
} from '../translations/commands.js';
import { logErrorFunctions } from '../translations/logs.js';
import { deleteResponse } from '../utils/channels.js';
import { getGuild, getMemberFromGuild } from '../utils/guild.js';
import { getCommandsWithPermission } from '../utils/permissions.js';

const name = 'help';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const member = await getMemberFromGuild(
    interaction.user.id,
    interaction.guild,
  );

  if (member === null) {
    await interaction.editReply(commandErrors.commandNoPermission);
    return;
  }

  await client.application?.commands.fetch();

  const commands = getCommandsWithPermission(member);
  const commandsPerPage = 8;
  const pages = Math.ceil(commands.length / commandsPerPage);
  const embed = getHelpEmbed(commands, 0, commandsPerPage);
  const components = [
    pages === 0 || pages === 1
      ? getPaginationComponents('help')
      : getPaginationComponents('help', 'start'),
  ];
  const message = await interaction.editReply({
    components,
    embeds: [embed],
  });
  const buttonIdle = getIntervalsProperty('buttonIdle');
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    idle: buttonIdle,
  });

  collector.on('collect', async (buttonInteraction) => {
    if (
      buttonInteraction.user.id !==
      buttonInteraction.message.interactionMetadata?.user.id
    ) {
      const mess = await buttonInteraction.reply({
        content: commandErrors.buttonNoPermission,
        flags: MessageFlags.Ephemeral,
      });
      void deleteResponse(mess);

      return;
    }

    const id = buttonInteraction.customId.split(':')[1];

    if (id === undefined) {
      return;
    }

    let buttons;
    let page =
      Number(
        buttonInteraction.message.embeds[0]?.footer?.text?.match(/\d+/gu)?.[0],
      ) - 1;

    switch (id) {
      case 'first':
        page = 0;
        break;

      case 'last':
        page = pages - 1;
        break;

      case 'next':
        page++;
        break;

      case 'previous':
        page--;
        break;

      default:
        page = 0;
        break;
    }

    if (page === 0 && (pages === 0 || pages === 1)) {
      buttons = getPaginationComponents('help');
    } else if (page === 0) {
      buttons = getPaginationComponents('help', 'start');
    } else if (page === pages - 1) {
      buttons = getPaginationComponents('help', 'end');
    } else {
      buttons = getPaginationComponents('help', 'middle');
    }

    const nextEmbed = getHelpEmbed(commands, page, commandsPerPage);

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(
        logErrorFunctions.interactionUpdateError(
          buttonInteraction.customId,
          error,
        ),
      );
    }
  });

  collector.on('end', async () => {
    try {
      await interaction.editReply({
        components: [getPaginationComponents('help')],
      });
    } catch (error) {
      logger.error(logErrorFunctions.collectorEndError(name, error));
    }
  });
};
