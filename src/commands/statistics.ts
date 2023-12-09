import {
  commandDescriptions,
  commandErrors,
  commandResponseFunctions,
} from "../translations/commands.js";
import {
  getMaxEmojisByBoostLevel,
  getMaxStickersByBoostLevel,
} from "../utils/boost.js";
import { getGuild } from "../utils/guild.js";
import { safeReplyToInteraction } from "../utils/messages.js";
import { getRoles } from "../utils/roles.js";
import {
  type ChatInputCommandInteraction,
  roleMention,
  SlashCommandBuilder,
} from "discord.js";

const name = "statistics";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Color")
  .addSubcommand((command) =>
    command
      .setName("color")
      .setDescription(commandDescriptions["statistics color"]),
  )
  .addSubcommand((command) =>
    command
      .setName("program")
      .setDescription(commandDescriptions["statistics program"]),
  )
  .addSubcommand((command) =>
    command
      .setName("year")
      .setDescription(commandDescriptions["statistics year"]),
  )
  .addSubcommand((command) =>
    command
      .setName("course")
      .setDescription(commandDescriptions["statistics course"]),
  )
  .addSubcommand((command) =>
    command
      .setName("notification")
      .setDescription(commandDescriptions["statistics notification"]),
  )
  .addSubcommand((command) =>
    command
      .setName("server")
      .setDescription(commandDescriptions["statistics server"]),
  )
  .setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const guild = await getGuild(interaction);

  if (guild === null) {
    await interaction.editReply(commandErrors.guildFetchFailed);

    return;
  }

  await guild.members.fetch();

  const subcommand = interaction.options.getSubcommand(true);

  if (
    subcommand === "color" ||
    subcommand === "program" ||
    subcommand === "year" ||
    subcommand === "course" ||
    subcommand === "notification"
  ) {
    const roles = getRoles(
      guild,
      subcommand === "course" ? "courses" : subcommand,
    );
    roles.sort((a, b) => b.members.size - a.members.size);
    const output = roles.map(
      (role) => `${roleMention(role.id)}: ${role.members.size}`,
    );

    if (subcommand === "course") {
      await safeReplyToInteraction(interaction, output.join("\n"));

      return;
    }

    await interaction.editReply({
      allowedMentions: {
        parse: [],
      },
      content: output.join("\n"),
    });
  } else {
    const output = [];
    const boostLevel = guild.premiumTier;

    output.push(commandResponseFunctions.serverMembersStat(guild.memberCount));

    await guild.channels.fetch();
    output.push(
      commandResponseFunctions.serverChannelsStat(
        guild.channels.cache.filter((channel) => !channel.isThread()).size,
      ),
    );

    await guild.roles.fetch();
    output.push(
      commandResponseFunctions.serverRolesStat(guild.roles.cache.size),
    );

    await guild.emojis.fetch();
    output.push(
      commandResponseFunctions.serverEmojiStat(
        guild.emojis.cache.size,
        getMaxEmojisByBoostLevel(boostLevel),
      ),
    );

    await guild.stickers.fetch();
    output.push(
      commandResponseFunctions.serverStickersStat(
        guild.stickers.cache.size,
        getMaxStickersByBoostLevel(boostLevel),
      ),
    );

    await guild.invites.fetch();
    output.push(
      commandResponseFunctions.serverInvitesStat(guild.invites.cache.size),
    );

    await interaction.editReply(output.join("\n"));
  }
};
