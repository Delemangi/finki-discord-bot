import { createPoll } from "../data/Poll.js";
import { createVipPoll } from "../data/VipPoll.js";
import { client } from "./client.js";
import { getConfigProperty } from "./config.js";
import { type Prisma } from "@prisma/client";
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type User,
  userMention,
} from "discord.js";

export const startPoll = async (
  interaction: ChatInputCommandInteraction,
  title: string,
  description: string,
  anonymous: boolean,
  multiple: boolean,
  open: boolean,
  options: string[],
  roles: string[],
  threshold: number
) => {
  const poll: Prisma.PollCreateInput = {
    anonymous,
    channelId: interaction.channelId,
    description,
    multiple,
    open,
    options: {
      create: options.map((opt) => ({ name: opt })),
    },
    roles,
    threshold,
    title,
    userId: interaction.user.id,
  };

  const createdPoll = await createPoll(poll);

  return createdPoll?.id ?? null;
};

export const startVipPoll = async (
  interaction: ButtonInteraction | ChatInputCommandInteraction,
  vipUser: User,
  type: string,
  threshold?: number
) => {
  let title;
  let description;

  if (type === "add" || type === "forceAdd") {
    title = `Влез во ВИП за ${vipUser.tag}`;
    description = `Дали сте за да стане корисникот ${
      vipUser.tag
    } (${userMention(vipUser.id)}) член на ВИП?`;
  } else if (type === "remove") {
    title = `Недоверба против ${vipUser.tag}`;
    description = `Дали сте за да биде корисникот ${vipUser.tag} (${userMention(
      vipUser.id
    )}) избркан од ВИП?`;
  } else if (type === "upgrade") {
    title = `Гласачки права за ${vipUser.tag}`;
    description = `Дали сте за да му биде дадено право на глас на корисникот ${
      vipUser.tag
    } (${userMention(vipUser.id)})?`;
  } else {
    title = `Непознат тип на анкета за ${vipUser.tag}`;
    description = "Настана некоја грешка со анкетата.";
  }

  const poll: Prisma.PollCreateInput = {
    anonymous: true,
    channelId: interaction.channelId,
    description,
    done: false,
    multiple: false,
    open: false,
    options: {
      create: [
        {
          name: "Да",
        },
        {
          name: "Не",
        },
      ],
    },
    roles: [(await getConfigProperty("roles")).vipVoting],
    threshold: threshold ?? 0.5,
    title,
    userId: client.user?.id ?? "",
  };

  const createdPoll = await createPoll(poll);

  if (createdPoll === null) {
    return null;
  }

  const vipPoll: Prisma.VipPollCreateInput = {
    poll: {
      connect: {
        id: createdPoll.id,
      },
    },
    type,
    userId: vipUser.id,
  };

  await createVipPoll(vipPoll);

  return createdPoll.id ?? null;
};
