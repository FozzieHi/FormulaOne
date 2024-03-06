import { Guild, GuildMember, GuildTextBasedChannel, Snowflake } from "discord.js";
import MutexManager from "../managers/MutexManager.js";
import { Constants, ModerationQueueButtons } from "../utility/Constants.js";
import { modQueue } from "./ModerationService.js";

export default new (class ViolationService {
  private violations: Map<Snowflake, { violationStart: number; violations: number }>;

  public reports: Array<{ channelId: Snowflake; messageId: Snowflake }>;

  public handled: Array<Snowflake>;

  constructor() {
    this.violations = new Map();
    this.reports = [];
    this.handled = [];
  }

  public async checkViolations(
    guild: Guild,
    channel: GuildTextBasedChannel,
    member: GuildMember,
    messageId: string | null,
  ) {
    if (member == null) {
      return;
    }
    const now = Date.now();
    await MutexManager.getUserMutex(member.id).runExclusive(async () => {
      if (guild == null || member == null) {
        return;
      }
      const violation = this.violations.get(member.id);
      if (violation) {
        if (violation.violationStart + 300000 > now) {
          const newViolations = violation.violations + 1;
          this.violations.set(member.id, {
            violationStart: violation.violationStart,
            violations: newViolations,
          });
          if (newViolations === 3) {
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
            );
          }
        } else {
          this.violations.set(member.id, {
            violationStart: now,
            violations: 1,
          });
        }
      } else {
        this.violations.set(member.id, {
          violationStart: now,
          violations: 1,
        });
      }
    });
  }
})();
