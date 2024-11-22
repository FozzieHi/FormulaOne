import { Guild, GuildMember, GuildTextBasedChannel, Snowflake } from "discord.js";
import MutexManager from "../managers/MutexManager.js";
import { Constants, ModerationQueueButtons } from "../utility/Constants.js";
import { modLog, modQueue } from "./ModerationService.js";
import { getDisplayTag } from "../utility/StringUtil.js";
import TryVal from "../utility/TryVal.js";
import db from "../database/index.js";
import { dm } from "../utility/Sender.js";

export default new (class ViolationService {
  private violations: Map<string, { violationStart: number; violations: number }>;

  public reports: Array<{ channelId: Snowflake; messageId: Snowflake }>;

  public handled: Set<Snowflake>;

  constructor() {
    this.violations = new Map();
    this.reports = [];
    this.handled = new Set();
  }

  public async checkViolations(
    guild: Guild,
    channel: GuildTextBasedChannel,
    member: GuildMember,
    messageId: string | null,
    type: "AUTOMOD" | "ONEWORD",
  ) {
    if (member == null) {
      return;
    }
    const now = Date.now();
    await MutexManager.getUserMutex(member.id).runExclusive(async () => {
      if (guild == null || member == null) {
        return;
      }
      const key = `${member.id}-${type}`;
      const violation = this.violations.get(key);
      if (violation) {
        if (violation.violationStart + 300000 > now) {
          const newViolations = violation.violations + 1;
          this.violations.set(key, {
            violationStart: violation.violationStart,
            violations: newViolations,
          });
          if (newViolations === (type === "AUTOMOD" ? 3 : 5)) {
            if (type === "AUTOMOD") {
              await member.roles.add(
                Constants.ROLES.MUTED,
                "Reaching three moderation-queue violations",
              );
              await modQueue(
                guild,
                member.user,
                channel.id,
                messageId,
                [
                  "Action",
                  "Reached 3 violations within 5 minutes",
                  "Result",
                  "Automatic Mute",
                ],
                Constants.BAN_COLOR,
                [
                  ModerationQueueButtons.PUNISH,
                  ModerationQueueButtons.BAN,
                  ModerationQueueButtons.UNMUTE,
                  ModerationQueueButtons.IGNORE,
                ],
                true,
              );
              await modLog(
                guild,
                null,
                [
                  "Action",
                  "Automatic Mute",
                  "Member",
                  `${getDisplayTag(member)} (${member.id})`,
                  "Reason",
                  "Reached 3 violations within 5 minutes",
                  "Channel",
                  channel.toString(),
                ],
                Constants.MUTE_COLOR,
                member.user,
              );
            } else {
              await modLog(
                guild,
                null,
                [
                  "Action",
                  "Automatic Mute",
                  "Member",
                  `${getDisplayTag(member)} (${member.id})`,
                  "Reason",
                  "Continued use of one word messages",
                  "Channel",
                  channel.toString(),
                ],
                Constants.MUTE_COLOR,
                member.user,
              );
              const role = await TryVal(guild.roles.fetch(Constants.ROLES.MUTED));
              if (role == null) {
                return;
              }

              if (await db.muteRepo?.anyMute(member.id, guild.id)) {
                return;
              }

              await dm(
                member.user,
                "You have been automatically muted for 5 minutes for continued one word usage.",
                undefined,
                false,
              );

              await db.muteRepo?.insertMute(member.id, guild.id, 300000);

              const logReason = "5 minute mute - Continued use of one word messages";
              await member.disableCommunicationUntil(Date.now() + 300000, logReason);
              await member.roles.add(role, logReason);
            }
          }
        } else {
          this.violations.set(key, {
            violationStart: now,
            violations: 1,
          });
        }
      } else {
        this.violations.set(key, {
          violationStart: now,
          violations: 1,
        });
      }
    });
  }
})();
