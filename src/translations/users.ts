import { type PartialUser } from '../types/PartialUser.js';
import { labels } from './labels.js';
import { inlineCode, userMention } from 'discord.js';

export const tagAndMentionUser = ({ tag, id }: PartialUser) =>
  `${inlineCode(tag)} (${userMention(id)})`;

export const formatUsers = (label: string, users: PartialUser[]) =>
  `# ${label}\n${
    users.length === 0
      ? labels.none
      : users.map((user) => '- ' + tagAndMentionUser(user)).join('\n')
  }`;
