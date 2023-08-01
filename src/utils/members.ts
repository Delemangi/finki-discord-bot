import { client } from "./client.js";

export const getUsername = (userId: string) => {
  const user = client.users.cache.get(userId);

  if (user === undefined) {
    return "-";
  }

  if (user?.discriminator) {
    return user.tag;
  }

  return user.username;
};
