import { Experience } from '../entities/Experience.js';
import { deleteResponse } from '../utils/channels.js';
import {
  addExperienceByUserId,
  getExperienceByUserId,
  getExperienceSorted,
  saveExperience,
} from '../utils/database.js';
import {
  getExperienceEmbed,
  getExperienceLeaderboardFirstPageEmbed,
  getExperienceLeaderboardNextPageEmbed,
  getPaginationComponents,
} from '../utils/embeds.js';
import { logger } from '../utils/logger.js';
import { commandDescriptions } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'experience';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('experience')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('get')
      .setDescription(commandDescriptions['experience get'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription(commandDescriptions['experience add'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(true),
      )
      .addNumberOption((option) =>
        option.setName('experience').setDescription('Поени').setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('leaderboard')
      .setDescription(commandDescriptions['experience leaderboard']),
  )
  .setDMPermission(false);

const handleExperienceGet = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const userId = user.id;
  let experience = await getExperienceByUserId(userId);

  if (experience === null) {
    experience = new Experience();
    experience.user = userId;
    experience.tag = user.tag;
    experience.messages = 0;
    experience.experience = 0n;
    experience.level = 0;

    await saveExperience(experience);
  }

  const embed = getExperienceEmbed(experience);
  await interaction.editReply({ embeds: [embed] });
};

const handleExperienceAdd = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser('user', true);
  const experience = interaction.options.getNumber('experience', true);

  await addExperienceByUserId(user.id, experience);

  await interaction.editReply(`Успешно се додадени ${experience} поени.`);
};

const handleExperienceLeaderboard = async (
  interaction: ChatInputCommandInteraction,
) => {
  const experience = await getExperienceSorted();

  if (experience === null) {
    await interaction.editReply('Настана грешка при превземање на податоците.');
    return;
  }

  const perPage = 8;
  const pages = Math.ceil(experience.length / perPage);
  const embed = getExperienceLeaderboardFirstPageEmbed(experience);
  const components = [
    pages === 0 || pages === 1
      ? getPaginationComponents('exp')
      : getPaginationComponents('exp', 'start'),
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
      buttons = getPaginationComponents('exp');
    } else if (page === 0) {
      buttons = getPaginationComponents('exp', 'start');
    } else if (page === pages - 1) {
      buttons = getPaginationComponents('exp', 'end');
    } else {
      buttons = getPaginationComponents('exp', 'middle');
    }

    const nextEmbed = getExperienceLeaderboardNextPageEmbed(experience, page);

    try {
      await buttonInteraction.update({
        components: [buttons],
        embeds: [nextEmbed],
      });
    } catch (error) {
      logger.error(`Failed to update exp command\n${error}`);
    }
  });

  collector.on('end', async () => {
    try {
      await interaction.editReply({
        components: [getPaginationComponents('exp')],
      });
    } catch (error) {
      logger.error(`Failed to end exp command\n${error}`);
    }
  });
};

const experienceHandlers = {
  add: handleExperienceAdd,
  get: handleExperienceGet,
  leaderboard: handleExperienceLeaderboard,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(experienceHandlers).includes(subcommand)) {
    await experienceHandlers[subcommand as keyof typeof experienceHandlers](
      interaction,
    );
  }
};
