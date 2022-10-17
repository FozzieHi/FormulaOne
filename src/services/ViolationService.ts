import { Message, Snowflake } from "discord.js";
import MutexManager from "../managers/MutexManager";
import { Constants, ModerationQueueButtons } from "../utility/Constants";
import { modQueue } from "./ModerationService";

export default new (class ViolationService {
  private violations: Map<Snowflake, { violationStart: number; violations: number }>;

  public reports: Array<{ channelId: Snowflake; messageId: Snowflake }>;

  constructor() {
    this.violations = new Map();
    this.reports = [];
  }

  public async checkViolations(message: Message) {
    if (message.member == null) {
      return;
    }
    const now = Date.now();
    await MutexManager.getUserMutex(message.member.id).runExclusive(async () => {
      if (message.guild == null || message.member == null) {
        return;
      }
      const violation = this.violations.get(message.member.id);
      if (violation) {
        if (violation.violationStart + 300000 > now) {
          const newViolations = violation.violations + 1;
          this.violations.set(message.member.id, {
            violationStart: violation.violationStart,
            violations: newViolations,
          });
          if (newViolations === 3) {
            await message.member.roles.add(
              Constants.ROLES.MUTED,
              "Reaching three moderation-queue violations"
            );
            await modQueue(
              message.guild,
              message.member.user,
              message.channel.id,
              message.id,
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
              ]
            );
          }
        } else {
          this.violations.set(message.member.id, {
            violationStart: now,
            violations: 1,
          });
        }
      } else {
        this.violations.set(message.member.id, {
          violationStart: now,
          violations: 1,
        });
      }
    });
  }
})();
