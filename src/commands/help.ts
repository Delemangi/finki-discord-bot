import { deleteResponse } from '../utils/channels.js';
import { client } from '../utils/client.js';
import {
  getHelpFirstPageEmbed,
  getHelpNextPageEmbed,
  getPaginationComponents,
} from '../utils/embeds.js';
import { logger } from '../utils/logger.js';
import { getCommandsWithPermission } from '../utils/permissions.js';
import { commandDescriptions } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  ComponentType,
  type GuildMember,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'help';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await client.application?.commands.fetch();

  const commandsPerPage = 8;
  const pages = Math.ceil(
    getCommandsWithPermission(interaction.member as GuildMember | null).length /
      commandsPerPage,
  );
  const embed = getHelpFirstPageEmbed(
    interaction.member as GuildMember | null,
    commandsPerPage,
  );
  const components = [
    pages === 0 || pages === 1
      ? getPaginationComponents('help')
      : getPaginationComponents('help', 'start'),
  ];
  const message = await interaction.editReply({
    components,
    embeds: [embed],
  });
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    idle: 30_000,
  });

  collector.on('collect', async (buttonInteraction) => {
    if (
      buttonInteraction.user.id !==
      buttonInteraction.message.interaction?.user.id
    ) {
      const mess = await buttonInteraction.reply({
        content: 'Ова не е ваша команда.',
        ephemeral: true,
      });
      deleteResponse(mess);
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

    if (id === 'first') {
      page = 0;
    } else if (id === 'last') {
      page = pages - 1;
    } else if (id === 'previous') {
      page--;
    } else if (id === 'next') {
      page++;
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

    const nextEmbed = getHelpNextPageEmbed(
      interaction.member as GuildMember | null,
      page,
      commandsPerPage,
    );

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(`Failed to update help command\n${error}`);
    }
  });

  collector.on('end', async () => {
    try {
      await interaction.editReply({
        components: [getPaginationComponents('help')],
      });
    } catch (error) {
      logger.error(`Failed to end help command\n${error}`);
    }
  });
};
