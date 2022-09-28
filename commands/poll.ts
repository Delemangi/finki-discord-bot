import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';

import { commands } from '../utils/strings.js';

const command = 'poll';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(commands[command])
  .addStringOption(option =>
    option.setName('title')
      .setDescription('Title of the poll.')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('options')
      .setDescription('Poll options. (Use comma and no spaces between options, ex: option1,option2,option3) ')
      .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const title = interaction.options.getString('title');
  const opts = interaction.options.getString('options')?.split(',');
  const optLength = opts?.length ?? 0;
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  
  if(optLength <= 10) {
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(title)
      .setDescription('Options:\n' +
        opts?.map((opt, index) => `${emojis[index]} ${opt}\n`).join('')
      )
      .setTimestamp();

    const msg = await interaction.editReply({ embeds: [embed] });
    for(let i = 0; i < optLength; i++) msg.react(`${emojis[i]}`);
  } else {
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setDescription('**Error!** Poll can have up to 10 options only.')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
