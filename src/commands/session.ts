import { getSessions } from "@app/utils/config.js";
import { commandDescriptions, commandErrors } from "@app/utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "session";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addStringOption((option) =>
    option
      .setName("session")
      .setDescription("Сесија")
      .setRequired(true)
      .setAutocomplete(true),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const session = interaction.options.getString("session", true);
  const information = Object.entries(getSessions()).find(
    ([key]) => key.toLowerCase() === session.toLowerCase(),
  );

  if (information === undefined) {
    await interaction.editReply(commandErrors.sessionNotFound);

    return;
  }

  await interaction.editReply({
    content: information[0],
    files: [`./sessions/${information[1]}`],
  });
};
