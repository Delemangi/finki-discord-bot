import {
  getMaxEmojisByBoostLevel,
  getMaxStickersByBoostLevel,
} from "../utils/boost.js";
import { splitMessage } from "../utils/functions.js";
import { getRoles } from "../utils/roles.js";
import { commandDescriptions } from "../utils/strings.js";
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
  if (interaction.guild === null) {
    return;
  }

  await interaction.guild.members.fetch();

  const subcommand = interaction.options.getSubcommand(true);

  if (
    subcommand === "color" ||
    subcommand === "program" ||
    subcommand === "year" ||
    subcommand === "course" ||
    subcommand === "notification"
  ) {
    const roles = getRoles(
      interaction.guild,
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
    const boostLevel = interaction.guild.premiumTier;

    output.push(`Членови: ${interaction.guild.memberCount}`);
    await interaction.guild.channels.fetch();
    output.push(`Канали: ${interaction.guild.channels.cache.size}`);
    output.push(
      `Канали (без нишки): ${
        interaction.guild.channels.cache.filter(
          (channel) => !channel.isThread(),
        ).size
      } / 500`,
    );
    await interaction.guild.roles.fetch();
    output.push(`Улоги: ${interaction.guild.roles.cache.size} / 250`);
    await interaction.guild.emojis.fetch();
    output.push(
      `Емоџиња: ${
        interaction.guild.emojis.cache.size
      } / ${getMaxEmojisByBoostLevel(boostLevel)}`,
    );
    await interaction.guild.stickers.fetch();
    output.push(
      `Стикери: ${
        interaction.guild.stickers.cache.size
      } / ${getMaxStickersByBoostLevel(boostLevel)}`,
    );
    await interaction.guild.invites.fetch();
    output.push(`Покани: ${interaction.guild.invites.cache.size}`);

    await interaction.editReply({
      allowedMentions: {
        parse: [],
      },
      content: output.join("\n"),
    });
  }
};
