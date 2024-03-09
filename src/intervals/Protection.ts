import { container } from "@sapphire/framework";
import { GuildVerificationLevel } from "discord.js";
import db from "../database/index.js";
import { Constants } from "../utility/Constants.js";
import { modLog } from "../services/ModerationService.js";
import ProtectionService from "../services/ProtectionService.js";
import { Guild as DBGuild } from "../database/models/Guild.js";
import { handleError } from "../utility/Logger.js";
import TryVal from "../utility/TryVal.js";

setInterval(() => {
  (async function run() {
    const guilds = (await db.guildRepo?.findMany()) as Array<DBGuild>;
    if (guilds == null) {
      return;
    }

    const now = Date.now();
    await ProtectionService.mutex.runExclusive(async () => {
      const promises = guilds.map(async (dbGuild) => {
        if (dbGuild != null) {
          if (
            dbGuild.protectionActivatedAt !== 0 &&
            Date.now() - dbGuild.protectionActivatedAt > 1.2e6
          ) {
            // 20 minutes
            const guild = await TryVal(container.client.guilds.fetch(dbGuild.guildId));
            if (guild != null) {
              if (guild.verificationLevel !== GuildVerificationLevel.High) {
                await guild.setVerificationLevel(
                  GuildVerificationLevel.High,
                  `Protection deactivated at ${now}`,
                );
                await modLog(
                  guild,
                  null,
                  ["Action", "Protection Deactivated", "Verification Level", "HIGH"],
                  Constants.UNMUTE_COLOR,
                );
              }
            }
            await db.guildRepo?.upsertGuild(dbGuild.guildId, {
              $set: {
                protectionActivatedAt: 0,
              },
            });
          }
        }
      });

      await Promise.all(promises);
    });
  })().catch((err) => handleError(err));
}, Constants.INTERVALS.PROTECTION);
