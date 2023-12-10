import {
  commandDescriptions,
  commandErrors,
} from "../translations/commands.js";
import { getGuild } from "../utils/guild.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type TextChannel,
} from "discord.js";

const name = "invite";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name]);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  const vanityCode = guild.vanityURLCode;

  if (vanityCode === null || vanityCode === undefined) {
    const invite = await guild.invites.create(
      guild.rulesChannel as TextChannel,
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
