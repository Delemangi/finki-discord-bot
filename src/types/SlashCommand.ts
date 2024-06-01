import {
  type ChatInputCommandInteraction,
  type SlashCommandOptionsOnlyBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export type SlashCommand = {
  data: SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};
