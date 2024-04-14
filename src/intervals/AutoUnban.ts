import { Document, ObjectId } from "mongodb";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord.js";
import db from "../database/index.js";
import { Constants } from "../utility/Constants.js";
import { handleError } from "../utility/Logger.js";
import { modLog } from "../services/ModerationService.js";
import { getUserTag } from "../utility/StringUtil.js";
import TryVal from "../utility/TryVal.js";

setInterval(() => {
  (async function run() {
    const bans = (await db.banRepo?.findMany()) as Array<Document>;

    const bansPromises = bans.map(async (ban) => {
      if (Date.now() > ban.bannedAt + ban.banLength) {
        const guild = await TryVal(
          container.client.guilds.fetch(ban.guildId as Snowflake),
        );

        if (guild != null) {
          const targetUser = await TryVal(
            container.client.users.fetch(ban.userId as Snowflake),
          );
          if (targetUser != null) {
            await guild.members.unban(targetUser, "Automatic Unban");
            await db.banRepo?.deleteById(ban._id as ObjectId);
            await modLog(
              guild,
              null,
              [
                "Action",
                "Automatic Unban",
                "User",
                `${getUserTag(targetUser)} (${targetUser.id})`,
              ],
              Constants.UNBAN_COLOR,
              targetUser,
            );
          }
        }
      }
    });

    await Promise.all(bansPromises);
  })().catch((err) => handleError(err));
}, Constants.INTERVALS.AUTO_UNBAN);
