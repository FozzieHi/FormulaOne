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
    originChannel: GuildTextBasedChannel,
    targetChannel?: GuildTextBasedChannel
  ): Promise<boolean> {
    if (
      (await ModerationService.getPermLevel(guild, moderator)) <
      (originChannel.id === Constants.CHANNELS.MOD_QUEUE ? 1 : 2)
    ) {
      return false;
    }
    if (await ModerationService.isModerator(guild, targetUser)) {
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
}
