import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import {
  getFromBotConfig,
  getLinks
} from './config.js';

const links = getLinks();

export function getAllLinks (): string[] {
  return links.map((l) => l.name);
}

export function getAllOptions (): Option[] {
  return links.map((l) => ({
    name: l.name.replaceAll('`', ''),
    value: l.name
  }));
}

export function getLink (name: string): Link | undefined {
  return links.find((link) => link.name.toLowerCase() === name.toLowerCase());
}

export function getEmbedFromLink (link: Link): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(link.name)
    .setTimestamp();

  if (link.description !== undefined) {
    embed.setDescription(link.description);
  }

  return embed;
}

export function getComponentsFromLink (link: Link): ActionRowBuilder<ButtonBuilder>[] {
  const components = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(new ButtonBuilder()
      .setURL(link.link)
      .setLabel('Link')
      .setStyle(ButtonStyle.Link));

  return [components];
}
