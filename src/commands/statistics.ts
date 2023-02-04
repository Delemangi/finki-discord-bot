import { getRoles } from '../utils/roles.js';
import { commands } from '../utils/strings.js';
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder
} from 'discord.js';

const name = 'statistics';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Color')
  .addSubcommand((command) => command
    .setName('color')
    .setDescription(commands['statistics color']));

export async function execute (interaction: ChatInputCommandInteraction) {
  if (interaction.guild === null) {
    return;
  }

  await interaction.guild?.members.fetch();

  const roles = getRoles(interaction.guild, 'color');
  const output = roles.sort((a, b) => b.members.size - a.members.size).map((role) => `${roleMention(role.id)}: ${role.members.size}`);

  await interaction.editReply({
    allowedMentions: { parse: [] },
    content: output.join('\n')
  });
}
