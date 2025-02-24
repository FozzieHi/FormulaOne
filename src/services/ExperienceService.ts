import {
  Channel,
  GuildMemberRoleManager,
  GuildTextBasedChannel,
  Message,
} from "discord.js";

import { Constants } from "../utility/Constants.js";
import db from "../database/index.js";

function baseExperience() {
  return Math.round(
    Math.random() * (Constants.XP.per_message.max - Constants.XP.per_message.min) +
      Constants.XP.per_message.min,
  );
}

function categoryModifier(category: Channel) {
  return Constants.XP.channel_category_multipliers[category.id] ?? 1;
}

function channelMultiplier(channel: GuildTextBasedChannel) {
  const multiplier = Constants.XP.channel_multipliers[channel.id];
  // If the current channel does not have a explicit multiplier,
  // maybe the Channel Category does.
  if (multiplier === undefined) {
    const category = channel.parent;
    return category !== null ? categoryModifier(category) : 1;
  }
  return multiplier;
}

function roleMultiplier(roles: GuildMemberRoleManager) {
  let highestMultiplier = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const [role] of roles.cache) {
    const multiplier = Constants.XP.role_multipliers[role];
    if (multiplier !== undefined) {
      if (multiplier === 0) return 0;
      highestMultiplier = Math.max(highestMultiplier, multiplier);
    }
  }

  return highestMultiplier !== 0 ? highestMultiplier : 1;
}

export function experienceForMessage(message: Message) {
  const roles = message.member?.roles;
  if (roles === undefined || !message.channel.isTextBased()) {
    return 0;
  }

  const channelExperience = channelMultiplier(message.channel as GuildTextBasedChannel);
  if (channelExperience === 0) return 0;

  const roleExperience = roleMultiplier(roles);
  if (roleExperience === 0) return 0;

  return Math.round(baseExperience() * (channelExperience + roleExperience));
}

export async function handleMessageExperience(message: Message) {
  if (message.author.bot || !message.inGuild()) {
    return;
  }
  const expGained = experienceForMessage(message);

  if (expGained === 0) {
    return;
  }

  await db.userRepo?.upsertUser(message.author.id, message.guildId, {
    $inc: { experience: expGained },
  });
}
