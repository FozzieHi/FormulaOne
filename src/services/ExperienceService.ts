import {
  Channel,
  GuildMember,
  GuildMemberRoleManager,
  GuildTextBasedChannel,
  Message,
  Snowflake,
} from "discord.js";

import { Constants } from "../utility/Constants.js";
import db from "../database/index.js";
import { modLog } from "./ModerationService.js";
import { getUserTag } from "../utility/StringUtil.js";
import { dm } from "../utility/Sender.js";

const cooldowns: Map<Snowflake, number> = new Map();

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

function experienceForMessage(message: Message) {
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

  return Math.round(baseExperience * (channelMultiplier * roleMultiplier));
}

async function assignUserRole(member: GuildMember, roleId: Snowflake) {
  await member.roles.add(roleId, "User Leveled Up");
}

export async function handleMessageExperience(message: Message) {
  if (message.author.bot || !message.inGuild()) {
    return;
  }
  const expGained = experienceForMessage(message);

  if (expGained === 0) {
    return;
  }

  const authorId = message.author.id;
  const cooldown = cooldowns.get(authorId);
  const now = new Date().getTime();

  if (cooldown === undefined || now - cooldown > Constants.XP.per_message.cooldown) {
    cooldowns.set(authorId, now);
  } else {
    return;
  }

  const updatedUser = await db.userRepo?.findUserAndUpsert(authorId, message.guildId, {
    $inc: { experience: expGained },
  });

  if (updatedUser == null || updatedUser.level > Constants.XP.levels.length) {
    return;
  }

  const requiredXp = Constants.XP.levels.find((f) => f.level === updatedUser.level);
  if (requiredXp != null && updatedUser.experience > requiredXp.xp) {
    await db.userRepo?.upsertUser(authorId, message.guildId, {
      $inc: {
        level: 1,
      },
    });
  }

  const newLevel = updatedUser.level + 1;

  await dm(
    message.author,
    `You just leveled up!\nYou are now level ${newLevel}`,
    undefined,
    false,
  );

  const roleToAssign = Object.keys(Constants.XP.level_roles).find(
    (levelRequired) => updatedUser.level === +levelRequired,
  );
  if (roleToAssign != null) {
    await assignUserRole(message.member as GuildMember, roleToAssign);
  }

  await modLog(
    message.guild,
    null,
    [
      "Action",
      "AssignRole",
      "User",
      `${getUserTag(message.author)} (${authorId})`,
      "Reason",
      `Leveled Up (Lvl ${updatedUser.level + 1})`,
    ],
    Constants.GREEN_COLOR,
    message.author,
  );
}
