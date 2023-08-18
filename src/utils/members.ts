import { client } from "./client.js";

export const getUsername = async (userId: string) => {
  const user = await client.users.fetch(userId);

  return user.tag;
};
