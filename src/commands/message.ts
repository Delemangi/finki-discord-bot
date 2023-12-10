import {
  commandDescriptions,
  commandErrors,
  commandResponses,
} from "../translations/commands.js";
import {
  type ChatInputCommandInteraction,
  type GuildBasedChannel,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

const name = "message";
const permission = PermissionFlagsBits.Administrator;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Канал во кој ќе се испрати пораката")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("Порака која ќе се испрати")
      .setRequired(true),
  )
  .setDefaultMemberPermissions(permission);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const channel = interaction.options.getChannel(
    "channel",
    true,
  ) as GuildBasedChannel;
  const message = interaction.options.getString("message", true);

  if (!channel.isTextBased()) {
    await interaction.editReply(commandErrors.invalidChannel);

    return;
  }

  await channel.send(message);
  await interaction.editReply(commandResponses.messageCreated);
};
