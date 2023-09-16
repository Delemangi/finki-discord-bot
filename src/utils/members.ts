import { client } from "./client.js";
import { getRoleProperty } from "./config.js";
import { type GuildMember, PermissionsBitField } from "discord.js";

export const getUsername = async (userId: string) => {
  const user = await client.users.fetch(userId);

  return user.tag;
};

export const isMemberInVip = async (member: GuildMember) => {
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }

  const vipRoleId = await getRoleProperty("vip");
  const adminRoleId = await getRoleProperty("admin");

  return (
    member.roles.cache.has(vipRoleId) || member.roles.cache.has(adminRoleId)
  );
};

export const isVipVotingMember = async (member: GuildMember) => {
  const vipVotingRoleId = await getRoleProperty("vipVoting");

  return member.roles.cache.has(vipVotingRoleId);
};

export const isMemberInvitedToVip = async (member: GuildMember) => {
  const boosterRoleId = await getRoleProperty("booster");
  const contributorRoleId = await getRoleProperty("contributor");
  const vipInvitedRoleId = await getRoleProperty("vipInvited");

  return (
    member.roles.cache.has(boosterRoleId) ||
    member.roles.cache.has(contributorRoleId) ||
    member.roles.cache.has(vipInvitedRoleId)
  );
};

export const isMemberAdmin = async (member: GuildMember) => {
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }

  const adminRoleId = await getRoleProperty("admin");

  return member.roles.cache.has(adminRoleId);
};
