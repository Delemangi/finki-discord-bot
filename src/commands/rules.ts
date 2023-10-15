import { getRules } from "../data/Rule.js";
import { getRulesEmbed } from "../utils/components.js";
import { commandDescriptions, commandErrors } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "rules";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const rules = await getRules();

  if (!rules) {
    await interaction.editReply(commandErrors.rulesFetchFailed);

    return;
  }

  const embed = await getRulesEmbed(rules);
  await interaction.editReply({
    embeds: [embed],
  });
};
