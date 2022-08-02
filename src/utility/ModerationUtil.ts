import { Guild, GuildTextBasedChannel, User } from "discord.js";
import db from "../database";
import { dm } from "./Sender";
import { PushUpdate } from "../database/updates/PushUpdate";
import { ModerationService, modLog } from "../services/ModerationService";
import { Constants } from "./Constants";

export class ModerationUtil {
  public static async ban(
    guild: Guild,
    targetUser: User,
    moderator: User,
    reason: string,
    channel: GuildTextBasedChannel
  ) {
    if ((await ModerationService.getPermLevel(guild, moderator)) < 2) {
      return;
    }
    if (await ModerationService.isModerator(guild, targetUser)) {
      return;
    }
    if (await db.banRepo?.anyBan(targetUser.id, guild.id)) {
      await db.banRepo?.deleteBan(targetUser.id, guild.id);
    }
    await dm(
      targetUser,
      `A moderator has banned you for the reason: ${reason}.`,
      channel,
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
        channelId: channel.id,
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
        channel.toString(),
      ],
      Constants.BAN_COLOR,
      targetUser
    );
  }
}
