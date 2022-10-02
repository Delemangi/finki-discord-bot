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
  const information = getStaff().find((staff) => staff.name === professor);

  if (information === undefined) {
    await interaction.editReply('No such professor exists.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(professor)
    .addFields(
      {
        name: 'Титула',
        value: information.title
      },
      {
        name: 'Електронска пошта',
        value: information.email
      },
      {
        name: 'ФИНКИ',
        value: `[Линк](${information.finki})`
      },
      {
        name: 'Courses',
        value: `[Линк](${information.courses})`
      },
      {
        name: 'Распоред',
        value: `[Линк](${information.raspored})`
      },
      {
        name: 'Консултации',
        value: `[Линк](${information.konsultacii})`
      }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
