import { Guild, GuildVerificationLevel } from "discord.js";
import { Mutex } from "async-mutex";
import { modLog } from "./ModerationService.js";
import { Constants } from "../utility/Constants.js";
import { getDBGuild } from "../utility/DatabaseUtil.js";
import db from "../database/index.js";

export default new (class ProtectionService {
  mutex: Mutex;

  private joinStats: { timestamp: number; joinedSince: number };

  constructor() {
    this.mutex = new Mutex();
    this.joinStats = { timestamp: Date.now(), joinedSince: 0 };
  }

  public async checkJoins(guild: Guild) {
    const now = Date.now();
    await this.mutex.runExclusive(async () => {
      if (this.joinStats.timestamp + 15000 > now) {
        this.joinStats = {
          timestamp: this.joinStats.timestamp,
          joinedSince: this.joinStats.joinedSince + 1,
        };
        if (this.joinStats.joinedSince === 15) {
          const dbGuild = await getDBGuild(guild.id);
          if (
            guild.verificationLevel === GuildVerificationLevel.VeryHigh &&
            dbGuild?.protectionActivatedAt === 0
          ) {
            return;
          }
          if (
            guild.verificationLevel !== GuildVerificationLevel.VeryHigh &&
            dbGuild?.protectionActivatedAt === 0
          ) {
            await guild.setVerificationLevel(
              GuildVerificationLevel.VeryHigh,
              `Protection activated at ${now}`,
            );
            await modLog(
              guild,
              null,
              ["Action", "Protection Activated", "Verification Level", "VERY_HIGH"],
              Constants.BAN_COLOR,
            );
          }
          await db.guildRepo?.upsertGuild(guild.id, {
            $set: { protectionActivatedAt: now },
          });
        }
      } else {
        this.joinStats = { timestamp: now, joinedSince: 0 };
      }
    });
  }
})();
