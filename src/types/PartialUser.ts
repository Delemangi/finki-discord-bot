import { type User } from "discord.js";

export type PartialUser = Pick<User, "tag" | "id">;
