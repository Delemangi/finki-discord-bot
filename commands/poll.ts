import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const command = 'poll';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command])
  .addStringOption((option) => option
    .setName('title')
    .setDescription('Title of the poll')
    .setRequired(true))
  .addStringOption((option) => option
    .setName('options')
    .setDescription('Up to 10 poll options, separated by commas')
    .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const title = interaction.options.getString('title', true);
  const options = interaction.options.getString('options', true).split(',');

  if (options.length <= 10) {
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(title)
      .setDescription(options.map((option, index) => `${emojis[index]} ${option.trim()}`).join('\n'))
      .setTimestamp();

    const message = await interaction.editReply({ embeds: [embed] });
    for (let i = 0; i < options.length; i++) {
      await message.react(`${emojis[i]}`);
    }
  } else {
    await interaction.editReply('Не може да има повеќе од 10 опции.');
  }
}
