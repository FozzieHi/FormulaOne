import { Guild, GuildTextBasedChannel, User } from "discord.js";
import db from "../database/index.js";
import { dm } from "./Sender.js";
import { PushUpdate } from "../database/updates/PushUpdate.js";
import { ModerationService, modLog } from "../services/ModerationService.js";
import { Constants } from "./Constants.js";

export async function ban(
  guild: Guild,
  targetUser: User,
  moderator: User,
  reason: string,
  originChannel: GuildTextBasedChannel,
  targetChannel?: GuildTextBasedChannel
): Promise<boolean> {
  if (
    reason == null ||
    (await ModerationService.getPermLevel(guild, moderator)) <
      (originChannel.id === Constants.CHANNELS.MOD_QUEUE ? 1 : 2) ||
    (await ModerationService.isModerator(guild, targetUser))
  ) {
    return false;
  }
  if (await db.banRepo?.anyBan(targetUser.id, guild.id)) {
    await db.banRepo?.deleteBan(targetUser.id, guild.id);
  }
  await dm(
    targetUser,
    `A moderator has banned you for the reason: ${reason}.`,
    originChannel,
    guild.members.cache.has(targetUser.id)
  );
  await guild.members.ban(targetUser, {
    reason: `(${moderator.tag}) ${reason}`,
  });
  await db.userRepo?.upsertUser(targetUser.id, guild.id, {
    $inc: { bans: 1 },
  });
  await db.userRepo?.upsertUser(
    targetUser.id,
    guild.id,
    new PushUpdate("punishments", {
      date: Date.now(),
      escalation: "Ban",
      reason,
      mod: moderator.tag,
      channelId: targetChannel?.id ?? originChannel.id,
    })
  );
  await modLog(
    guild,
    moderator,
    [
      "Action",
      "Ban",
      "User",
      `${targetUser.tag.toString()} (${targetUser.id})`,
      "Reason",
      reason,
      "Channel",
      targetChannel?.toString() ?? originChannel.toString(),
    ],
    Constants.BAN_COLOR,
    targetUser
  );
  return true;
}
