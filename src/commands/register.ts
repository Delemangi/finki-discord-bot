import { getCommands } from "../utils/commands.js";
import { getApplicationId, getToken } from "../utils/config.js";
import { logger } from "../utils/logger.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponses,
  logErrorFunctions,
} from "../utils/strings.js";
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
    await interaction.editReply(commandResponses.commandsRegistered);
  } catch (error) {
    await interaction.editReply(commandErrors.commandsNotRegistered);
    logger.error(logErrorFunctions.commandsRegistrationError(error));
  }
};
