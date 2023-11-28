import { getConfigProperty } from "@app/utils/config.js";
import { addExperience } from "@app/utils/experience.js";
import { logger } from "@app/utils/logger.js";
import { logErrorFunctions } from "@app/utils/strings.js";
import { type ClientEvents, Events, type Message } from "discord.js";

export const name = Events.MessageCreate;
const crosspostChannels = await getConfigProperty("crosspostChannels");

const crosspost = async (message: Message) => {
  if (
    !(await getConfigProperty("crossposting")) ||
    crosspostChannels.length === 0 ||
    !crosspostChannels.includes(message.channel.id)
  ) {
    return;
  }

  try {
    await message.crosspost();
  } catch (error) {
    logger.error(logErrorFunctions.crosspostError(message.channel.id, error));
  }
};

export const execute = async (...[message]: ClientEvents[typeof name]) => {
  await crosspost(message);
  await addExperience(message);
};
