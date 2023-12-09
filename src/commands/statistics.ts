import {
  commandDescriptions,
  commandErrors,
} from "../translations/commands.js";
import {
  getMaxEmojisByBoostLevel,
  getMaxStickersByBoostLevel,
} from "../utils/boost.js";
import { splitMessage } from "../utils/functions.js";
import { getGuild } from "../utils/guild.js";
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
      let followUp = false;

      for (const message of splitMessage(output.join("\n"))) {
        if (followUp) {
          await interaction.followUp({
            allowedMentions: {
              parse: [],
            },
            content: message,
          });
        } else {
          await interaction.editReply({
            allowedMentions: {
              parse: [],
            },
            content: message,
          });
        }

        followUp = true;
      }

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

    output.push(`Членови: ${guild.memberCount}`);

    await guild.channels.fetch();
    output.push(`Канали: ${guild.channels.cache.size}`);
    output.push(
      `Канали (без нишки): ${
        guild.channels.cache.filter((channel) => !channel.isThread()).size
      } / 500`,
    );

    await guild.roles.fetch();
    output.push(`Улоги: ${guild.roles.cache.size} / 250`);

    await guild.emojis.fetch();
    output.push(
      `Емоџиња: ${guild.emojis.cache.size} / ${getMaxEmojisByBoostLevel(
        boostLevel,
      )}`,
    );

    await guild.stickers.fetch();
    output.push(
      `Стикери: ${guild.stickers.cache.size} / ${getMaxStickersByBoostLevel(
        boostLevel,
      )}`,
    );

    await guild.invites.fetch();
    output.push(`Покани: ${guild.invites.cache.size}`);

    await interaction.editReply({
      allowedMentions: {
        parse: [],
      },
      content: output.join("\n"),
    });
  }
};
