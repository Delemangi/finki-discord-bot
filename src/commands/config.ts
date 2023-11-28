import { ConfigSchema } from "@app/schemas/ConfigSchema.js";
import { commandDescriptions } from "@app/translations/commands.js";
import { type BotConfig } from "@app/types/BotConfig.js";
import {
  getConfigKeys,
  getConfigProperty,
  setConfigProperty,
} from "@app/utils/config.js";
import { createPollChoices } from "@app/utils/polls.js";
import { refreshOnConfigChange } from "@app/utils/refresh.js";
import {
  type ChatInputCommandInteraction,
  codeBlock,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

const name = "config";
const permission = PermissionFlagsBits.ManageMessages;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Конгифурација")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("get")
      .setDescription(commandDescriptions["config get"])
      .addStringOption((option) =>
        option
          .setName("key")
          .setDescription("Клуч на конфигурација")
          .setRequired(true)
          .addChoices(...createPollChoices(getConfigKeys())),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription(commandDescriptions["config set"])
      .addStringOption((option) =>
        option
          .setName("key")
          .setDescription("Клуч на конфигурација")
          .setRequired(true)
          .addChoices(...createPollChoices(getConfigKeys())),
      )
      .addStringOption((option) =>
        option
          .setName("value")
          .setDescription("Вредност на конфигурација")
          .setRequired(true),
      ),
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(permission);

const handleConfigGet = async (interaction: ChatInputCommandInteraction) => {
  const key = interaction.options.getString("key", true) as keyof BotConfig;
  const value = await getConfigProperty(key);

  await interaction.editReply(
    codeBlock(
      "json",
      JSON.stringify(
        {
          [key]: value,
        },
        null,
        2,
      ),
    ),
  );
};

const handleConfigSet = async (interaction: ChatInputCommandInteraction) => {
  const key = interaction.options.getString("key", true) as keyof BotConfig;
  let value;

  try {
    value = JSON.parse(interaction.options.getString("value", true));
    ConfigSchema.shape[key].parse(value);
  } catch (error) {
    await interaction.editReply(
      // @ts-expect-error error is not null
      commandErrorFunctions.invalidConfiguration(error.message),
    );

    return;
  }

  const newConfig = await setConfigProperty(key, value);
  const newProperty = JSON.stringify(
    {
      // @ts-expect-error newConfig is not null
      [key]: newConfig[key],
    },
    null,
    2,
  );

  void refreshOnConfigChange(key);
  await interaction.editReply(codeBlock("json", newProperty));
};

const configHandlers = {
  get: handleConfigGet,
  set: handleConfigSet,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  if (Object.keys(configHandlers).includes(subcommand)) {
    await configHandlers[subcommand as keyof typeof configHandlers](
      interaction,
    );
  }
};
