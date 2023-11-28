import { type PartialUser } from "@app/types/PartialUser.js";
import { inlineCode, userMention } from "discord.js";

export const tagAndMentionUser = ({ tag, id }: PartialUser) =>
  `${inlineCode(tag)} (${userMention(id)})`;
