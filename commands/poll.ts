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
import { createCustomPollId } from '../utils/functions.js';
import { CommandsDescription } from '../utils/strings.js';

const keyv = new Keyv(getFromBotConfig('keyvDB'));

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Poll')
  .addSubcommand((command) => command
    .setName('create')
    .setDescription(CommandsDescription['poll create'])
    .addStringOption((option) => option
      .setName('title')
      .setDescription('Title of the poll')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('options')
      .setDescription('Up to 25 poll options, separated by commas')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('stats')
    .setDescription(CommandsDescription['poll stats'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('ID of the poll you want to get stats from')
      .setRequired(true)));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  if (interaction.options.getSubcommand() === 'create') {
    const title = interaction.options.getString('title', true);
    const options = interaction.options.getString('options', true).split(',').filter(Boolean).map((option) => option.trim());
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    let ID = createCustomPollId(8);
    let firstID: Poll = await keyv.get(ID);

    while (firstID !== undefined) {
      ID = createCustomPollId(8);
      firstID = await keyv.get(ID);
    }

    if (options.length <= 1) {
      await interaction.editReply('Анкетата мора да има барем две опции!');
      return;
    }

    for (let i = 0; i < options.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons: ButtonBuilder[] = [];

      for (let j = i; j < i + 5; j++) {
        if (options[j] === undefined) {
          break;
        }

        const button = new ButtonBuilder()
          .setCustomId(`poll:${ID}:${j}`)
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
        .setDescription(codeBlock(options.map((option, index) => `${(index + 1).toString().padStart(2, '0')}. ${option.padEnd(Math.max(...options.map((o: string) => o.length)))} - [....................] - 0 [00.00%]`).join('\n')))
        .addFields({
          name: 'Гласови',
          value: '0'
        })
        .setTimestamp()
        .setFooter({ text: `Анкета: ${ID}` });

      await interaction.editReply({
        components,
        embeds: [embed]
      });

      await keyv.set(ID, {
        options,
        optionVotes: Array.from({ length: options.length }).fill(0),
        participants: [],
        title,
        votes: 0
      });
    } else {
      await interaction.editReply('Вашата анкета не може да има повеќе од 25 опции!');
    }
  } else if (interaction.options.getSubcommand() === 'stats') {
    const id = interaction.options.getString('id', true);
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    const poll: Poll = await keyv.get(id);

    if (id.length > 0 && id !== undefined) {
      const embed = new EmbedBuilder()
        .setColor(getFromBotConfig('color'))
        .setTitle(poll.title)
        .setDescription(`Вкупно гласови: ${poll.votes}`)
        .addFields({
          name: 'Опции',
          value: poll.options.map((opt, index) => `${index + 1}. ${opt} (${poll.participants.filter((obj) => obj.vote === index).length})`).join('\n')
        })
        .setTimestamp();

      for (let i = 0; i < poll.options.length; i += 5) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        const buttons: ButtonBuilder[] = [];

        for (let j = i; j < i + 5; j++) {
          if (poll.options[j] === undefined) {
            break;
          }

          const button = new ButtonBuilder()
            .setCustomId(`pollstats:${id}:${j}`)
            .setLabel(`${j + 1}`)
            .setStyle(ButtonStyle.Secondary);

          buttons.push(button);
        }

        row.addComponents(buttons);
        components.push(row);
      }

      await interaction.editReply({
        components,
        embeds: [embed]
      });
    } else {
      await interaction.editReply('Не постои таква анкета.');
    }
  }
}
