import { type PartialUser } from "../types/PartialUser.js";
import { inlineCode, userMention } from "discord.js";

export const tagAndMentionUser = ({ tag, id }: PartialUser) =>
  `${inlineCode(tag)} (${userMention(id)})`;
