import { getCommands } from "../utils/commands.js";
import { getApplicationId, getToken } from "../utils/config.js";
import { commandDescriptions } from "../utils/strings.js";
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

const name = "register";
const permission = PermissionFlagsBits.Administrator;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(commandDescriptions[name])
  .setDMPermission(false)
  .setDefaultMemberPermissions(permission);

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const rest = new REST().setToken(getToken());
  const commands = [];

  for (const [, command] of await getCommands()) {
    commands.push(command.data.toJSON());
  }

  try {
    await rest.put(Routes.applicationCommands(getApplicationId()), {
      body: commands,
    });
    await interaction.editReply("Успешно се регистрирани сите команди.");
  } catch (error) {
    throw new Error(`Failed to register application commands\n${error}`);
  }
};
