import {
  getConfigKeys,
  getConfigProperty,
  setConfigProperty,
} from '../configuration/main.js';
import { refreshOnConfigChange } from '../configuration/refresh.js';
import {
  BotConfigKeysSchema,
  RequiredBotConfigSchema,
} from '../lib/schemas/BotConfig.js';
import {
  commandDescriptions,
  commandErrorFunctions,
} from '../translations/commands.js';
import { createCommandChoices } from '../utils/commands.js';
import {
  type ChatInputCommandInteraction,
  codeBlock,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

const name = 'config';
const permission = PermissionFlagsBits.ManageMessages;

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Конгифурација')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('get')
      .setDescription(commandDescriptions['config get'])
      .addStringOption((option) =>
        option
          .setName('key')
          .setDescription('Клуч на конфигурација')
          .setRequired(true)
          .addChoices(...createCommandChoices(getConfigKeys())),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('set')
      .setDescription(commandDescriptions['config set'])
      .addStringOption((option) =>
        option
          .setName('key')
          .setDescription('Клуч на конфигурација')
          .setRequired(true)
          .addChoices(...createCommandChoices(getConfigKeys())),
      )
      .addStringOption((option) =>
        option
          .setName('value')
          .setDescription('Вредност на конфигурација')
          .setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(permission);

const handleConfigGet = async (interaction: ChatInputCommandInteraction) => {
  const key = BotConfigKeysSchema.parse(
    interaction.options.getString('key', true),
  );
  const value = await getConfigProperty(key);

  await interaction.editReply(
    codeBlock(
      'json',
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
  const key = BotConfigKeysSchema.parse(
    interaction.options.getString('key', true),
  );
  let value;

  try {
    value = JSON.parse(interaction.options.getString('value', true));
    RequiredBotConfigSchema.shape[key].parse(value);
  } catch (error) {
    await interaction.editReply(
      commandErrorFunctions.invalidConfiguration(String(error)),
    );

    return;
  }

  const newConfig = await setConfigProperty(key, value);

  if (newConfig === null) {
    await interaction.editReply(
      commandErrorFunctions.invalidConfiguration(value),
    );

    return;
  }

  const newProperty = JSON.stringify(
    {
      // @ts-expect-error not worth validating
      [key]: newConfig[key],
    },
    null,
    2,
  );

  void refreshOnConfigChange(key);
  await interaction.editReply(codeBlock('json', newProperty));
};

const configHandlers = {
  get: handleConfigGet,
  set: handleConfigSet,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand in configHandlers) {
    await configHandlers[subcommand as keyof typeof configHandlers](
      interaction,
    );
  }
};
