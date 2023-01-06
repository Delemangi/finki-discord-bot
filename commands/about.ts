import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  inlineCode
} from 'discord.js';
import { getFromBotConfig } from '../utils/config.js';
import { CommandsDescription } from '../utils/strings.js';

const command = 'about';

const embed = new EmbedBuilder()
  .setColor(getFromBotConfig('color'))
  .setTitle('ФИНКИ Discord бот')
  .setThumbnail('https://cdn.discordapp.com/attachments/946729216152576020/1016773768938541106/finki-logo.png')
  .setDescription(`Овој бот е развиен од <@198249751001563136> за потребите на Discord серверот на студентите на ФИНКИ. Ботот е open source и може да се најде на [GitHub](https://github.com/Delemangi/finki-discord-bot). Ако имате било какви прашања, предлози или проблеми, контактирајте нè на Discord или на GitHub. \n\nНапишете ${inlineCode('/help')} за да ги видите сите достапни команди од ботот. Останатите функционалности се достапни на GitHub.`)
  .setTimestamp();

export const data = new SlashCommandBuilder()
  .setName(command)
  .setDescription(CommandsDescription[command]);

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.editReply({ embeds: [embed] });
}
