import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';
import {
  getClassrooms,
  getFromBotConfig
} from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'classroom';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command])
  .addStringOption((option) => option
    .setName('classroom')
    .setDescription('Classroom')
    .setRequired(true)
    .setAutocomplete(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const classroom = interaction.options.getString('classroom', true);
  const information = getClassrooms().find((c) => c.classroom.toString().toLowerCase() === classroom.toLowerCase());

  if (information === undefined) {
    await interaction.editReply('Не постои таа просторија.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(information.classroom.toString())
    .addFields(
      {
        name: 'Тип',
        value: information.type
      },
      {
        name: 'Локација',
        value: information.location
      },
      {
        name: 'Спрат',
        value: information.floor.toString()
      },
      {
        name: 'Капацитет',
        value: information.capacity.toString()
      }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
