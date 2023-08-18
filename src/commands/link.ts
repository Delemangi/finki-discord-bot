import { getLinkComponents, getLinkEmbed } from "../utils/components.js";
import { getLinks } from "../utils/config.js";
import { commandDescriptions } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "link";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addStringOption((option) =>
    option
      .setName("link")
      .setDescription("Линк")
      .setRequired(true)
      .setAutocomplete(true)
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const keyword = interaction.options.getString("link", true);
  const link = getLinks().find((li) => li.name === keyword);

  if (link === undefined) {
    await interaction.editReply("Не постои таков линк.");
    return;
  }

  const embed = await getLinkEmbed(link);
  const components = getLinkComponents(link);
  await interaction.editReply({
    components,
    embeds: [embed],
  });
};
