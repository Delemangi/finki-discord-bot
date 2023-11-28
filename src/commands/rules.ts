import { getRulesEmbed } from "@app/components/scripts.js";
import { getRules } from "@app/data/Rule.js";
import { commandDescriptions, commandErrors } from "@app/utils/strings.js";
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
