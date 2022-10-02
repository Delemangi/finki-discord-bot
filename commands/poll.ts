import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  codeBlock
} from 'discord.js';
import Keyv from 'keyv';
import { getFromBotConfig } from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

const keyv = new Keyv(getFromBotConfig('keyvDB'));

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
  const options = interaction.options.getString('options', true).split(',').filter(Boolean);
  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  for (let i = 0; i < options.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons: ButtonBuilder[] = [];

    for (let j = i; j < i + 5; j++) {
      if (options[j] === undefined) {
        break;
      }

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
      .setDescription(codeBlock(options.map((option, index) => `${(index + 1).toString().padStart(2, '0')}. ${option.trim().padEnd(Math.max(...options.map((o: string) => o.length)))} - '[....................]' - 00.00%`).join('\n')))
      .setTimestamp();

    const message = await interaction.editReply({
      components,
      embeds: [embed]
    });
    await keyv.set(message.id, {
      options,
      optionVotes: Array.from({ length: options.length }).fill(0),
      participants: [],
      title,
      votes: 0
    });
  } else {
    await interaction.editReply('Вашата анкета не може да има повеќе од 25 опции!');
  }
}
