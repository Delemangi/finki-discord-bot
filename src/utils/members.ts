import { client } from "./client.js";
import { getConfigProperty } from "./config.js";
import { type GuildMember, PermissionsBitField } from "discord.js";

export const getUsername = async (userId: string) => {
  const user = await client.users.fetch(userId);

  return user.tag;
};

export const isMemberInVip = async (member: GuildMember) => {
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }

  const { vip, admin } = await getConfigProperty("roles");

  return member.roles.cache.has(vip) || member.roles.cache.has(admin);
};

export const isVipVotingMember = async (member: GuildMember) => {
  const { vipVoting } = await getConfigProperty("roles");

  return member.roles.cache.has(vipVoting);
};

export const isMemberInvitedToVip = async (member: GuildMember) => {
  const { booster, contributor, vipInvited } = await getConfigProperty("roles");

  return (
    member.roles.cache.has(booster) ||
    member.roles.cache.has(contributor) ||
    member.roles.cache.has(vipInvited)
  );
};

export const isMemberAdmin = async (member: GuildMember) => {
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }

  const { admin } = await getConfigProperty("roles");

  return member.roles.cache.has(admin);
};
