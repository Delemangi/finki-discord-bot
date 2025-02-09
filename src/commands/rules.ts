import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { getRulesEmbed } from '../components/scripts.js';
import { getRules } from '../data/Rule.js';
import {
  commandDescriptions,
  commandErrors,
} from '../translations/commands.js';

const name = 'rules';

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const rules = await getRules();

  if (!rules) {
    await interaction.editReply(commandErrors.rulesFetchFailed);

    return;
  }

  const embed = getRulesEmbed(rules);
  await interaction.editReply({
    embeds: [embed],
  });
};
