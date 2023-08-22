import { getLink } from "../data/Link.js";
import { getLinkComponents, getLinkEmbed } from "../utils/components.js";
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
  const link = await getLink(keyword);

  if (link === null) {
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
