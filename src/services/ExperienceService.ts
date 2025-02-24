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

function channelModifier(channel: GuildTextBasedChannel) {
  const channelMultiplier = Constants.XP.channel_multipliers[channel.id];
  if (channelMultiplier === undefined) {
    const category = channel.parent;
    return category !== null ? categoryModifier(category) : 1;
  }
  return channelMultiplier;
}

function roleModifier(roles: GuildMemberRoleManager) {
  const availableModifiers = roles.cache
    .map((_, role) => Constants.XP.role_multipliers[role])
    .filter((role) => role !== undefined);

  // if no modifier is defined just multiply by 1 keeping the current value.
  if (availableModifiers.length === 0) {
    return 1;
  }
  return availableModifiers.reduce((prev, curr) =>
    prev === 0 ? 0 : Math.max(prev, curr),
  );
}

export function experienceForMessage(message: Message) {
  const roles = message.member?.roles;
  if (roles === undefined || message.channel.isTextBased()) {
    return 0;
  }
  const channelExperience = channelModifier(message.channel);
  const roleExperience = roleModifier(roles);
  if (channelExperience === 0 || roleExperience === 0) {
    return 0;
  }

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
