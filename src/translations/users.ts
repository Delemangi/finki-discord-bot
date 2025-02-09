import { inlineCode, userMention } from 'discord.js';

import { type PartialUser } from '../lib/types/PartialUser.js';
import { labels } from './labels.js';

export const tagAndMentionUser = ({ id, tag }: PartialUser) =>
  `${inlineCode(tag)} (${userMention(id)})`;

export const formatUsers = (label: string, users: PartialUser[]) => {
  users.sort((a, b) => a.tag.localeCompare(b.tag));

  return `# ${label} (${users.length})\n${
    users.length === 0
      ? labels.none
      : users
          .map((user, index) => `${index}. ${tagAndMentionUser(user)}`)
          .join('\n')
  }`;
};
