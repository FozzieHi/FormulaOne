/* eslint-disable no-await-in-loop */
import { container } from "@sapphire/framework";
import db from "../database/index.js";
import { Constants } from "../utility/Constants.js";
import { modLog } from "../services/ModerationService.js";
import ProtectionService from "../services/ProtectionService.js";
import { Guild } from "../database/models/Guild.js";

setInterval(() => {
  (async function run() {
    const guilds = (await db.guildRepo?.findMany()) as Array<Guild>;
    if (guilds == null) {
      return;
    }

    const now = Date.now();
    await ProtectionService.mutex.runExclusive(async () => {
      for (let i = 0; i < guilds.length; i += 1) {
        const dbGuild = guilds[i];
        if (dbGuild != null) {
          if (
            dbGuild.protectionActivatedAt !== 0 &&
            Date.now() - dbGuild.protectionActivatedAt > 1.2e6
          ) {
            // 20 minutes
            const guild = container.client.guilds.cache.get(dbGuild.guildId);
            if (guild != null) {
              if (guild.verificationLevel !== "HIGH") {
                await guild.setVerificationLevel(
                  "HIGH",
                  `Protection deactivated at ${now}`
                );
                await modLog(
                  guild,
                  null,
                  ["Action", "Protection Deactivated", "Verification Level", "HIGH"],
                  Constants.UNMUTE_COLOR
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
      }
    });
  })().catch((err) => container.logger.error(err));
}, Constants.INTERVALS.PROTECTION);
