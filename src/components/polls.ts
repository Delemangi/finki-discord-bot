import {
  generatePollPercentageBar,
  truncateString,
} from "@app/components/utils.js";
import { getMostPopularOptionByPollId } from "@app/data/PollOption.js";
import {
  getPollVotesByOptionId,
  getPollVotesByPollId,
} from "@app/data/PollVote.js";
import { type PollWithOptions } from "@app/types/PollWithOptions.js";
import { getConfigProperty } from "@app/utils/config.js";
import { getUsername } from "@app/utils/members.js";
import { getPollThreshold } from "@app/utils/polls.js";
import { getMembersWithRoles } from "@app/utils/roles.js";
import {
  embedMessageFunctions,
  embedMessages,
  paginationStringFunctions,
  shortStrings,
} from "@app/utils/strings.js";
import { type Poll, type SpecialPoll } from "@prisma/client";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  codeBlock,
  EmbedBuilder,
  type Guild,
  inlineCode,
  italic,
  roleMention,
  userMention,
} from "discord.js";

export const getPollEmbed = async (poll: PollWithOptions) => {
  const votes = (await getPollVotesByPollId(poll.id))?.length ?? 0;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setAuthor(
      poll.done
        ? {
            name: embedMessages.pollEnded,
          }
        : null,
    )
    .setTitle(truncateString(poll.title, 256))
    .setDescription(
      `${italic(truncateString(poll.description, 1_000))}\n${codeBlock(
        (
          await Promise.all(
            poll.options.map(async (option, index) => {
              const optionVotes =
                (await getPollVotesByOptionId(option.id))?.length ?? 0;
              const fraction = (optionVotes / votes) * 100;
              const bar =
                votes === 0
                  ? generatePollPercentageBar(0)
                  : generatePollPercentageBar(fraction);

              return `${(index + 1)
                .toString()
                .padStart(2, "0")} ${option.name.padEnd(
                Math.max(...poll.options.map((opt) => opt.name.length)),
              )} - [${bar}] - ${optionVotes} [${
                votes > 0 ? fraction.toFixed(2).padStart(5, "0") : "00"
              }%]`;
            }),
          )
        ).join("\n"),
      )}${
        poll.done
          ? `\n${shortStrings.result}: ${inlineCode(
              poll.decision ??
                (await getMostPopularOptionByPollId(poll.id))?.name ??
                "-",
            )}\n`
          : ""
      }`,
    )
    .setFooter({
      text: `${shortStrings.poll}: ${poll.id}`,
    })
    .setTimestamp();
};

export const getPollComponents = (poll: PollWithOptions) => {
  const components = [];
  const firstRow = new ActionRowBuilder<ButtonBuilder>();
  const firstButtons = [];
  const highestIndex = Math.min(poll.options.length, 4);

  const infoButton = new ButtonBuilder()
    .setCustomId(`poll:${poll.id}:info`)
    .setLabel(embedMessages.pollInformation)
    .setStyle(ButtonStyle.Secondary);

  firstButtons.push(infoButton);

  for (let index = 0; index < highestIndex; index++) {
    const option = poll.options[index];
    const button = new ButtonBuilder()
      .setCustomId(`poll:${poll.id}:${option?.id}`)
      .setLabel(truncateString(`${index + 1}. ${option?.name}`, 80))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(poll.done);

    firstButtons.push(button);
  }

  firstRow.addComponents(firstButtons);
  components.push(firstRow);

  if (highestIndex === 4) {
    for (let index1 = highestIndex; index1 < poll.options.length; index1 += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const buttons = [];

      for (let index2 = index1; index2 < index1 + 5; index2++) {
        const option = poll.options[index2];

        if (option === undefined) {
          break;
        }

        const button = new ButtonBuilder()
          .setCustomId(`poll:${poll.id}:${option.id}`)
          .setLabel(truncateString(`${index2 + 1}. ${option.name}`, 80))
          .setStyle(ButtonStyle.Primary)
          .setDisabled(poll.done);

        buttons.push(button);
      }

      row.addComponents(buttons);
      components.push(row);
    }
  }

  return components;
};

export const getPollInfoEmbed = async (guild: Guild, poll: Poll) => {
  const votes = (await getPollVotesByPollId(poll.id))?.length ?? 0;
  const voters = await getMembersWithRoles(guild, ...poll.roles);
  const threshold = await getPollThreshold(poll.id);
  const turnout = `(${((votes / voters.length) * 100).toFixed(2)}%)`;

  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(poll.title)
    .addFields(
      {
        inline: true,
        name: shortStrings.multipleChoice,
        value: poll.multiple ? shortStrings.yes : shortStrings.no,
      },
      {
        inline: true,
        name: shortStrings.anonymous,
        value: poll.anonymous ? shortStrings.yes : shortStrings.no,
      },
      {
        inline: true,
        name: shortStrings.open,
        value: poll.open ? shortStrings.yes : shortStrings.no,
      },
      {
        inline: true,
        name: shortStrings.author,
        value: userMention(poll.userId),
      },
      {
        inline: true,
        name: shortStrings.votes,
        value: `${votes} ${poll.roles.length > 0 ? turnout : ""}`,
      },
      {
        inline: true,
        name: shortStrings.rightToVote,
        value:
          poll.roles.length === 0
            ? shortStrings.all
            : (
                await getMembersWithRoles(guild, ...poll.roles)
              ).length.toString(),
      },
      {
        inline: true,
        name: shortStrings.requiredMajority,
        value: `${poll.threshold * 100}% (${threshold})`,
      },
      {
        inline: true,
        name: shortStrings.roles,
        value:
          poll.roles.length > 0
            ? poll.roles.map((role) => roleMention(role)).join(", ")
            : shortStrings.none,
      },
      {
        inline: true,
        name: "\u200B",
        value: "\u200B",
      },
    )
    .setFooter({
      text: `${shortStrings.poll}: ${poll.id}`,
    })
    .setTimestamp();
};

export const getPollStatsComponents = (poll: PollWithOptions) => {
  const components = [];

  for (let index1 = 0; index1 < poll.options.length; index1 += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = [];

    for (let index2 = index1; index2 < index1 + 5; index2++) {
      if (poll.options[index2] === undefined) {
        break;
      }

      const button = new ButtonBuilder()
        .setCustomId(`pollStats:${poll.id}:${poll.options[index2]?.id}`)
        .setLabel(`${truncateString(poll.options[index2]?.name, 80)}`)
        .setStyle(ButtonStyle.Secondary);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
};

export const getPollListFirstPageEmbed = async (
  polls: Poll[],
  all: boolean = false,
  pollsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.polls)
    .setDescription(embedMessageFunctions.allPolls(all))
    .addFields(
      ...polls.slice(0, pollsPerPage).map((poll) => ({
        name:
          all && poll.done
            ? `${poll.title} (${shortStrings.closed})`
            : poll.title,
        value: poll.id,
      })),
    )
    .setFooter({
      text: paginationStringFunctions.pollPage(
        1,
        Math.max(1, Math.ceil(polls.length / pollsPerPage)),
        polls.length,
      ),
    })
    .setTimestamp();
};

export const getPollListNextPageEmbed = async (
  polls: Poll[],
  page: number,
  all: boolean = false,
  pollsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.polls)
    .setDescription(embedMessageFunctions.allPolls(all))
    .addFields(
      ...polls
        .slice(pollsPerPage * page, pollsPerPage * (page + 1))
        .map((poll) => ({
          name:
            all && poll.done
              ? `${poll.title} (${shortStrings.closed})`
              : poll.title,
          value: poll.id,
        })),
    )
    .setFooter({
      text: paginationStringFunctions.pollPage(
        page + 1,
        Math.max(1, Math.ceil(polls.length / pollsPerPage)),
        polls.length,
      ),
    })
    .setTimestamp();
};

export const getSpecialPollListFirstPageEmbed = async (
  polls: SpecialPoll[],
  pollsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.polls)
    .setDescription(embedMessages.allSpecialPolls)
    .addFields(
      ...(await Promise.all(
        polls.slice(0, pollsPerPage).map(async (poll) => ({
          name: `${poll.type} (${await getUsername(poll.userId)})`,
          value: poll.id,
        })),
      )),
    )
    .setFooter({
      text: paginationStringFunctions.pollPage(
        1,
        Math.max(1, Math.ceil(polls.length / pollsPerPage)),
        polls.length,
      ),
    })
    .setTimestamp();
};

export const getSpecialPollListNextPageEmbed = async (
  polls: SpecialPoll[],
  page: number,
  pollsPerPage: number = 8,
) => {
  return new EmbedBuilder()
    .setColor(await getConfigProperty("color"))
    .setTitle(shortStrings.polls)
    .setDescription(embedMessages.allSpecialPolls)
    .addFields(
      ...(await Promise.all(
        polls
          .slice(pollsPerPage * page, pollsPerPage * (page + 1))
          .map(async (poll) => ({
            name: `${poll.type} (${await getUsername(poll.userId)})`,
            value: poll.id,
          })),
      )),
    )
    .setFooter({
      text: paginationStringFunctions.pollPage(
        page + 1,
        Math.max(1, Math.ceil(polls.length / pollsPerPage)),
        polls.length,
      ),
    })
    .setTimestamp();
};