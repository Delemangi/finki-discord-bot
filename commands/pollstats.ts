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

const command = 'pollstats';

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command])
  .addStringOption((option) => option
    .setName('pollid')
    .setDescription('ID of the poll you want to get stats from.')
    .setRequired(true));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  const pollId = interaction.options.getString('pollid', true);
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  const poll = await keyv.get(pollId);

  if(pollId.length > 0 && pollId !== undefined) {
    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(`Poll Statistics`)
      .setDescription(codeBlock(`Poll ID: ${pollId}\nNumber of Options: ${poll.optionsLen}\nTotal Votes: ${poll.votes}\n`))
      .setTimestamp();

    for (let i = 0; i < poll.options.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons: ButtonBuilder[] = [];
  
      for (let j = i; j < i + 5; j++) {
        if (poll.options[j] === undefined) {
          break;
        }
  
        const button = new ButtonBuilder()
          .setCustomId(`pollstats:${pollId}:${j}`)
          .setLabel(`${j + 1}`)
          .setStyle(ButtonStyle.Secondary);
  
        buttons.push(button);
      }
  
      row.addComponents(buttons);
      components.push(row);
    }

    await interaction.editReply({ components, embeds: [embed] });
  } else {
    await interaction.editReply(`You entered an invalid Poll ID or something went wrong on our end.`);
  }
}
