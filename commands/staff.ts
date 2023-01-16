import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';
import {
  getFromBotConfig,
  getStaff
} from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'staff';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command])
  .addStringOption((option) => option
    .setName('professor')
    .setDescription('The professor to get the information for')
    .setRequired(true)
    .setAutocomplete(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const professor = interaction.options.getString('professor', true);
  const information = getStaff().find((staff) => staff.name.toLowerCase() === professor.toLowerCase());

  if (information === undefined) {
    await interaction.editReply('Не постои таков професор.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(`${information.name}`)
    .addFields(
      {
        inline: true,
        name: 'Звање',
        value: information.title
      },
      {
        inline: true,
        name: 'Позиција',
        value: information.position
      },
      {
        name: 'Електронска пошта',
        value: information.email
      },
      {
        inline: true,
        name: 'ФИНКИ',
        value: information.finki === '' ? '-' : `[Линк](${information.finki})`
      },
      {
        inline: true,
        name: 'Courses',
        value: information.courses === '' ? '-' : `[Линк](${information.courses})`
      },
      {
        inline: true,
        name: 'Распоред',
        value: information.raspored === '' ? '-' : `[Линк](${information.raspored})`
      },
      {
        inline: true,
        name: 'Консултации',
        value: information.konsultacii === '' ? '-' : `[Линк](${information.konsultacii})`
      }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
