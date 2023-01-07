/* eslint-disable complexity */
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  codeBlock,
  PermissionsBitField
} from 'discord.js';
import Keyv from 'keyv';
import { getFromBotConfig } from '../utils/config.js';
import {
  generatePollID,
  generatePercentageBar,
  commandMention
} from '../utils/functions.js';
import { CommandsDescription } from '../utils/strings.js';

const keyv = new Keyv(getFromBotConfig('keyvDB'));

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Poll')
  .addSubcommand((command) => command
    .setName('create')
    .setDescription(CommandsDescription['poll create'])
    .addStringOption((option) => option
      .setName('title')
      .setDescription('Title of the poll')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('options')
      .setDescription('Up to 25 poll options, separated by commas')
      .setRequired(true))
    .addBooleanOption((option) => option
      .setName('public')
      .setDescription('Option for everyone to contribute to a poll (Default is false)')))
  .addSubcommand((command) => command
    .setName('stats')
    .setDescription(CommandsDescription['poll stats'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('ID of the poll you want to get stats from')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('show')
    .setDescription(CommandsDescription['poll show'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('ID of the poll you want to show')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('add')
    .setDescription(CommandsDescription['poll add'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('ID of the poll you want to add options to')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('options')
      .setDescription('Options to add to the poll (Max: 25 total options)')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('remove')
    .setDescription(CommandsDescription['poll remove'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('ID of the poll you want to remove options from')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('options')
      .setDescription('Indices of options to remove from the poll (ex: 1,3,7...)')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('public')
    .setDescription(CommandsDescription['poll public'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('ID of the poll you want to change it\'s accessibility')
      .setRequired(true))
    .addBooleanOption((option) => option
      .setName('public')
      .setDescription('Change the \'public\' status of a poll')
      .setRequired(true)))
  .addSubcommand((command) => command
    .setName('delete')
    .setDescription(CommandsDescription['poll delete'])
    .addStringOption((option) => option
      .setName('id')
      .setDescription('ID of the poll you want to delete')
      .setRequired(true)));

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
  if (interaction.options.getSubcommand() === 'create') {
    const title = interaction.options.getString('title', true);
    const options = interaction.options.getString('options', true).split(',').filter(Boolean).map((option) => option.trim());
    const isPublic = interaction.options.getBoolean('public', false) ?? false;
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    let ID = generatePollID(8);
    let firstID: Poll = await keyv.get(ID);

    while (firstID !== undefined) {
      ID = generatePollID(8);
      firstID = await keyv.get(ID);
    }

    if (options.length <= 1) {
      await interaction.editReply('Анкетата мора да има барем две опции!');
      return;
    }

    for (let i = 0; i < options.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons: ButtonBuilder[] = [];

      for (let j = i; j < i + 5; j++) {
        if (options[j] === undefined) {
          break;
        }

        const button = new ButtonBuilder()
          .setCustomId(`poll:${ID}:${j}`)
          .setLabel(`${j + 1}`)
          .setStyle(ButtonStyle.Secondary);

        buttons.push(button);
      }

      row.addComponents(buttons);
      components.push(row);
    }

    if (options.length <= 25) {
      const embed = new EmbedBuilder()
        .setColor(getFromBotConfig('color'))
        .setTitle(title)
        .setDescription(codeBlock(options.map((option, index) => `${(index + 1).toString().padStart(2, '0')}. ${option.padEnd(Math.max(...options.map((o: string) => o.length)))} - [....................] - 0 [00.00%]`).join('\n')))
        .addFields(
          {
            inline: true,
            name: 'Гласови',
            value: '0'
          },
          {
            inline: true,
            name: 'Јавна анкета',
            value: isPublic ? 'Да' : 'Не'
          }
        )
        .setTimestamp()
        .setFooter({ text: `Анкета: ${ID}` });

      await interaction.editReply({
        components,
        embeds: [embed]
      });

      await keyv.set(ID, {
        isPublic,
        options,
        optionVotes: Array.from({ length: options.length }).fill(0),
        owner: interaction.user.id,
        participants: [],
        title,
        votes: 0
      });
    } else {
      await interaction.editReply('Вашата анкета не може да има повеќе од 25 опции!');
    }
  } else if (interaction.options.getSubcommand() === 'stats') {
    const id = interaction.options.getString('id', true);
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    const poll: Poll = await keyv.get(id);

    if (!poll) {
      await interaction.editReply('Грешка при наоѓање на анкетата.');
      return;
    }

    if (id.length > 0 && id !== undefined) {
      const embed = new EmbedBuilder()
        .setColor(getFromBotConfig('color'))
        .setTitle(poll.title)
        .setDescription(`Вкупно гласови: ${poll.votes}`)
        .addFields({
          name: 'Опции',
          value: poll.options.map((opt, index) => `${index + 1}. ${opt} (${poll.participants.filter((obj) => obj.vote === index).length})`).join('\n')
        })
        .setTimestamp();

      for (let i = 0; i < poll.options.length; i += 5) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        const buttons: ButtonBuilder[] = [];

        for (let j = i; j < i + 5; j++) {
          if (poll.options[j] === undefined) {
            break;
          }

          const button = new ButtonBuilder()
            .setCustomId(`pollstats:${id}:${j}`)
            .setLabel(`${j + 1}`)
            .setStyle(ButtonStyle.Secondary);

          buttons.push(button);
        }

        row.addComponents(buttons);
        components.push(row);
      }

      await interaction.editReply({
        components,
        embeds: [embed]
      });
    } else {
      await interaction.editReply('Грешка при наоѓање на анкетата.');
    }
  } else if (interaction.options.getSubcommand() === 'show') {
    const id = interaction.options.getString('id', true);
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    const poll: Poll = await keyv.get(id);

    if (!poll) {
      await interaction.editReply('Грешка при наоѓање на анкетата.');
      return;
    }

    for (let i = 0; i < poll.options.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons: ButtonBuilder[] = [];

      for (let j = i; j < i + 5; j++) {
        if (poll.options[j] === undefined) {
          break;
        }

        const button = new ButtonBuilder()
          .setCustomId(`poll:${id}:${j}`)
          .setLabel(`${j + 1}`)
          .setStyle(ButtonStyle.Secondary);

        buttons.push(button);
      }

      row.addComponents(buttons);
      components.push(row);
    }

    const embed = new EmbedBuilder()
      .setColor(getFromBotConfig('color'))
      .setTitle(poll.title)
      .setDescription(codeBlock(poll.options.map((option, index) => `${String(index + 1).padStart(2, '0')}. ${option.padEnd(Math.max(...poll.options.map((o) => o.length)))} - [${poll.votes > 0 ? generatePercentageBar(Number(poll.optionVotes[index]) / poll.votes * 100) : generatePercentageBar(0)}] - ${poll.optionVotes[index]} [${poll.votes > 0 ? (Number(poll.optionVotes[index]) / poll.votes * 100).toFixed(2).padStart(5, '0') : '00'}%]`).join('\n')))
      .addFields(
        {
          inline: true,
          name: 'Гласови',
          value: String(poll.votes)
        },
        {
          inline: true,
          name: 'Јавна анкета',
          value: poll.isPublic ? 'Да' : 'Не'
        }
      )
      .setTimestamp()
      .setFooter({ text: `Анкета: ${id}` });

    await interaction.editReply({
      components,
      embeds: [embed]
    });
  } else if (interaction.options.getSubcommand() === 'public') {
    const id = interaction.options.getString('id', true);
    const isPublic = interaction.options.getBoolean('public', true);
    const poll: Poll = await keyv.get(id);

    if (!poll) {
      await interaction.editReply('Грешка при наоѓање на анкетата.');
      return;
    }

    if (poll.owner !== interaction.user.id) {
      await interaction.editReply('Ова не е ваша анкета.');
      return;
    }

    await keyv.set(id, {
      isPublic,
      options: poll.options,
      optionVotes: poll.optionVotes,
      owner: poll.owner,
      participants: poll.participants,
      title: poll.title,
      votes: poll.votes
    });

    await interaction.editReply(`Успешно го изменивте 'public' статусот на анкета ${id} во **${isPublic}**.`);
  } else if (interaction.options.getSubcommand() === 'add') {
    const id = interaction.options.getString('id', true);
    const options = interaction.options.getString('options', true).split(',').filter(Boolean).map((option) => option.trim());
    const poll: Poll = await keyv.get(id);

    if (!poll) {
      await interaction.editReply('Грешка при наоѓање на анкетата.');
      return;
    }

    if (poll.isPublic === false && poll.owner !== interaction.user.id) {
      await interaction.editReply('Ова не е ваша анкета.');
      return;
    }

    if (options.length < 1) {
      await interaction.editReply('Мора да дадете барем една опција!');
      return;
    }

    const newOptions = poll.options;
    const newOptionVotes = poll.optionVotes;

    for (const option of options) {
      if (newOptions.length <= 25) {
        newOptions.push(option);
        newOptionVotes.push(0);
      }
    }

    await keyv.set(id, {
      isPublic: poll.isPublic,
      options: newOptions,
      optionVotes: newOptionVotes,
      owner: poll.owner,
      participants: poll.participants,
      title: poll.title,
      votes: poll.votes
    });

    await interaction.editReply(`Успешно додадовте опции во анкетата. Користете ${commandMention('poll show')} за да ги видите промените.`);
  } else if (interaction.options.getSubcommand() === 'remove') {
    const id = interaction.options.getString('id', true);
    const options = interaction.options.getString('options', true).split(',').filter(Boolean).map((option) => option.trim()).map(Number).sort((a, b) => b - a);
    const poll: Poll = await keyv.get(id);

    if (!poll) {
      await interaction.editReply('Грешка при наоѓање на анкетата.');
      return;
    }

    if (poll.owner !== interaction.user.id) {
      await interaction.editReply('Ова не е ваша анкета.');
      return;
    }

    for (let i = 1; i < options.length; i++) {
      if (options[i] === options[i - 1]) {
        options.splice(i, 1);
      }
    }

    const newOptions = poll.options;
    const newOptionVotes = poll.optionVotes;

    for (const option of options) {
      const op = Number(option) - 1;
      if (op >= 0 && op < poll.options.length) {
        newOptions.splice(op, 1);
        newOptionVotes.splice(op, 1);
      }
    }

    if (newOptionVotes.length < 1) {
      await keyv.delete(id);
      await interaction.editReply('Ги тргнавте сите опции и со тоа ја избришавте анкетата.');
      return;
    }

    let newVotes = 0;
    for (const optionVote of newOptionVotes) {
      newVotes += optionVote;
    }

    await keyv.set(id, {
      isPublic: poll.isPublic,
      options: newOptions,
      optionVotes: newOptionVotes,
      owner: poll.owner,
      participants: poll.participants,
      title: poll.title,
      votes: newVotes
    });

    await interaction.editReply(`Успешно тргнавте опции од анкетата. Користете ${commandMention('poll show')} за да ги видите промените.`);
  } else if (interaction.options.getSubcommand() === 'delete') {
    const id = interaction.options.getString('id', true);
    const poll: Poll = await keyv.get(id);

    if (!poll) {
      await interaction.editReply('Грешка при наоѓање на анкетата.');
      return;
    }

    const permissions = interaction.member?.permissions as PermissionsBitField;
    if (!permissions.has(PermissionsBitField.Flags.Administrator) && !permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await interaction.editReply('Оваа команда е само за администратори.');
      return;
    }

    const deletePoll = await keyv.delete(id);

    if (deletePoll) {
      await interaction.editReply(`Успешно ја избришавте анкетата ${id}.`);
    } else {
      await interaction.editReply(`Имаше проблем при бришење на анкетата ${id}. Обидете се повторно.`);
    }
  }
}
