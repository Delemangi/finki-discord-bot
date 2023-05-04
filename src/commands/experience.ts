import { Experience } from '../entities/Experience.js';
import {
  addExperienceByUserId,
  getExperienceByUserId,
  saveExperience,
} from '../utils/database.js';
import { getExperienceEmbed } from '../utils/embeds.js';
import { commands, errors } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'experience';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('experience')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('get')
      .setDescription(commands['experience get'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription(commands['experience add'])
      .addUserOption((option) =>
        option.setName('user').setDescription('Корисник').setRequired(true),
      )
      .addNumberOption((option) =>
        option.setName('experience').setDescription('Поени').setRequired(true),
      ),
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
    experience.experience = 0;
    experience.level = 0;

    await saveExperience(experience);
  }

  const embed = getExperienceEmbed(experience);
  await interaction.reply({ embeds: [embed] });
};

const handleExperienceAdd = async (
  interaction: ChatInputCommandInteraction,
) => {
  const permissions = interaction.member?.permissions as
    | PermissionsBitField
    | undefined;
  if (
    permissions === undefined ||
    !permissions.has(PermissionsBitField.Flags.Administrator)
  ) {
    await interaction.editReply(errors.adminOnlyCommand);
  }

  const user = interaction.options.getUser('user', true);
  const experience = interaction.options.getNumber('experience', true);

  await addExperienceByUserId(user.id, experience);

  await interaction.editReply(`Успешно се додадени ${experience} поени.`);
};

const experienceHandlers = {
  add: handleExperienceAdd,
  get: handleExperienceGet,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand(true);

  if (Object.keys(experienceHandlers).includes(subcommand)) {
    await experienceHandlers[subcommand as keyof typeof experienceHandlers](
      interaction,
    );
  }
};
