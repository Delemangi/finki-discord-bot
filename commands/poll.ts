import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

import Keyv from 'keyv';
const keyv = new Keyv(getFromBotConfig('keyvDB'));
// percentageValues: 0, 0.25, 0.5, 0.75, 1
//const percentageValues = ['.', '░', '▒', '▓', '█'];
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
    .setDescription('Up to 25 poll options, separated by commas')
    .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const title = interaction.options.getString('title', true);
  const options = interaction.options.getString('options', true).split(',');
  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  for(let i = 0; i < options.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons: ButtonBuilder[] = [];

    for(let j = i; j < i + 5; j++) {
      if(options[j] === undefined) break;

      const button = new ButtonBuilder()
        .setCustomId(`poll:${j}`)
        .setLabel(`${j + 1}`)
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }
  
  if (options.length <= 25) {
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(title)
      .setDescription(options.map((option, index) => `${index + 1}. ${option.trim()} - **(0%)**`).join('\n'))
      .setTimestamp();

    const message = await interaction.editReply({ embeds: [embed], components });
    await keyv.set(message.id, {
      title: title,
      options: options,
      votes: 0,
      optionVotes: new Array<number>(options.length).fill(0),
      participants: []
    });
  } else {
    await interaction.editReply('Вашата анкета не може да има повеќе од 25 опции!');
  }
}
