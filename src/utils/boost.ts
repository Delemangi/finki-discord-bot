import { GuildPremiumTier } from "discord.js";

export const getMaxEmojisByBoostLevel = (boostLevel: GuildPremiumTier) => {
  switch (boostLevel) {
    case GuildPremiumTier.None:
      return 50;

    case GuildPremiumTier.Tier1:
      return 100;

    case GuildPremiumTier.Tier2:
      return 150;

    case GuildPremiumTier.Tier3:
      return 250;

    default:
      return 50;
  }
};

export const getMaxStickersByBoostLevel = (boostLevel: GuildPremiumTier) => {
  switch (boostLevel) {
    case GuildPremiumTier.None:
      return 5;

    case GuildPremiumTier.Tier1:
      return 15;

    case GuildPremiumTier.Tier2:
      return 30;

    case GuildPremiumTier.Tier3:
      return 60;

    default:
      return 5;
  }
};
