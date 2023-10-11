import {
  type ChatInputCommandInteraction,
  type ContextMenuCommandBuilder,
  type ContextMenuCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandSubcommandGroupBuilder,
} from "discord.js";

export type Command = {
  data:
    | ContextMenuCommandBuilder
    | SlashCommandBuilder
    | SlashCommandSubcommandGroupBuilder;
  execute: (
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
  ) => Promise<void>;
};
