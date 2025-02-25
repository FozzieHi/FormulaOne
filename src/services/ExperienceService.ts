import {
  Channel,
  GuildMemberRoleManager,
  GuildTextBasedChannel,
  Message,
} from "discord.js";

import { Constants } from "../utility/Constants.js";
// import db from "../database/index.js";

function getBaseExperience() {
  return Math.round(
    Math.random() * (Constants.XP.per_message.max - Constants.XP.per_message.min) +
      Constants.XP.per_message.min,
  );
}

function getCategoryMultiplier(category: Channel) {
  return Constants.XP.channel_category_multipliers[category.id] ?? 1;
}

function getChannelMultiplier(channel: GuildTextBasedChannel) {
  const multiplier = Constants.XP.channel_multipliers[channel.id];
  // If the current channel does not have a explicit multiplier,
  // maybe the Channel Category does.
  if (multiplier === undefined) {
    const category = channel.parent;
    return category !== null ? getCategoryMultiplier(category) : 1;
  }
  return multiplier;
}

function getRoleMultiplier(roles: GuildMemberRoleManager) {
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

  const baseExperience = getBaseExperience();

  const channelMultiplier = getChannelMultiplier(
    message.channel as GuildTextBasedChannel,
  );
  if (channelMultiplier === 0) return 0;

  const roleMultiplier = getRoleMultiplier(roles);
  if (roleMultiplier === 0) return 0;

  console.log(
    `Base: ${baseExperience}, Channel: ${channelMultiplier}x, Role: ${roleMultiplier}x`,
  );

  return Math.round(baseExperience * (channelMultiplier * roleMultiplier));
}

export async function handleMessageExperience(message: Message) {
  if (message.author.bot || !message.inGuild()) {
    return;
  }
  const expGained = experienceForMessage(message);

  if (expGained === 0) {
    // return;
  }

  console.log(`Total ${expGained}`);

  // await db.userRepo?.upsertUser(message.author.id, message.guildId, {
  //   $inc: { experience: expGained },
  // });
}
