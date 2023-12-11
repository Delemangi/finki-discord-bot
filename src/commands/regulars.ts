import { getVipBanByUserId } from "../data/VipBan.js";
import {
  commandDescriptions,
  commandErrors,
  commandResponses,
} from "../translations/commands.js";
import { getRoleProperty } from "../utils/config.js";
import { getMemberFromGuild } from "../utils/guild.js";
import { isMemberInVip, isMemberInvitedToVip } from "../utils/members.js";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const name = "regulars";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Regulars")
  .addSubcommand((command) =>
    command
      .setName("add")
      .setDescription(commandDescriptions["regulars add"])
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Предлог корисник за член на редовните")
          .setRequired(true),
      ),
  )
  .addSubcommand((command) =>
    command
      .setName("remove")
      .setDescription(commandDescriptions["regulars remove"])
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Предлог корисник за член на редовните")
          .setRequired(true),
      ),
  );

const handleRegularsAdd = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const member = await getMemberFromGuild(user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  const vipBan = await getVipBanByUserId(user.id);

  if (vipBan !== null) {
    await interaction.editReply(commandErrors.userVipBanned);

    return;
  }

  if (await isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  if (await isMemberInvitedToVip(member)) {
    await interaction.editReply(commandErrors.userRegular);

    return;
  }

  const regularRole = await getRoleProperty("regular");
  await member.roles.add(regularRole);

  await interaction.editReply(commandResponses.userGivenRegular);
};

const handleRegularsRemove = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser("user", true);
  const member = await getMemberFromGuild(user.id, interaction);

  if (member === null) {
    await interaction.editReply(commandErrors.userNotMember);

    return;
  }

  if (await isMemberInVip(member)) {
    await interaction.editReply(commandErrors.userVipMember);

    return;
  }

  const regularRole = await getRoleProperty("regular");
  await member.roles.remove(regularRole);

  await interaction.editReply(commandResponses.userRemovedRegular);
};

const regularsHandlers = {
  add: handleRegularsAdd,
  remove: handleRegularsRemove,
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand in regularsHandlers) {
    await regularsHandlers[subcommand as keyof typeof regularsHandlers](
      interaction,
    );
  }
};
