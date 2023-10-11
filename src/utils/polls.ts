import { createPoll } from "../data/Poll.js";
import { createVipPoll } from "../data/VipPoll.js";
import { client } from "./client.js";
import { getRoleProperty } from "./config.js";
import { vipStringFunctions } from "./strings.js";
import { type Prisma } from "@prisma/client";
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type User,
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
  threshold: number,
) => {
  const poll: Prisma.PollCreateInput = {
    anonymous,
    channelId: interaction.channelId,
    description,
    multiple,
    open,
    options: {
      create: options.map((opt) => ({
        name: opt,
      })),
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
  threshold?: number,
) => {
  let title;
  let description;
  const partialUser = {
    id: vipUser.id,
    tag: vipUser.tag,
  };

  switch (type) {
    case "add":
      title = vipStringFunctions.vipAddTitle(vipUser.tag);
      description = vipStringFunctions.vipAddDescription(partialUser);
      break;

    case "remove":
      title = vipStringFunctions.vipRemoveTitle(vipUser.tag);
      description = vipStringFunctions.vipRemoveDescription(partialUser);
      break;

    case "upgrade":
      title = vipStringFunctions.vipUpgradeTitle(vipUser.tag);
      description = vipStringFunctions.vipUpgradeDescription(partialUser);
      break;

    case "ban":
      title = vipStringFunctions.vipBanTitle(vipUser.tag);
      description = vipStringFunctions.vipBanDescription(partialUser);
      break;

    case "unban":
      title = vipStringFunctions.vipUnbanTitle(vipUser.tag);
      description = vipStringFunctions.vipUnbanDescription(partialUser);
      break;

    default:
      return null;
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
    roles: [await getRoleProperty("vipVoting")],
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
