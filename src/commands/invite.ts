import { commandDescriptions, commandErrors } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type TextChannel,
} from "discord.js";

const name = "invite";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const vanityCode = interaction.guild?.vanityURLCode;

  if (vanityCode === null || vanityCode === undefined) {
    const invite = await interaction.guild?.invites.create(
      interaction.guild.rulesChannel as TextChannel,
      {
        maxAge: 0,
        maxUses: 0,
        unique: true,
      },
    );

    if (invite === undefined) {
      await interaction.editReply(commandErrors.inviteCreationFailed);

      return;
    }

    await interaction.editReply(`https://discord.gg/${invite.code}`);

    return;
  }

  await interaction.editReply(`https://discord.gg/${vanityCode}`);
};
