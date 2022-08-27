import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';

const links: EmbedInfo[] = JSON.parse(readFileSync('./config/links.json', 'utf8'));

export function getAllLinks (): string[] {
  return links.map(link => link.name);
}

export function getAllOptions (): EmbedInfo[] {
  return links.map(link => {
    return { name: link.name.replaceAll('`', ''), value: link.name };
  });
}

export function getLink (keyword: string): EmbedInfo {
  return links.find(link => link.name === keyword) ?? { name: 'No link found', value: 'No link found' };
}

export function getEmbedFromLink (link: EmbedInfo): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('Orange')
    .setTitle(link.name)
    .setDescription(link.value)
    .setTimestamp();
}
