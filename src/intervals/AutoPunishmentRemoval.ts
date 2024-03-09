import { Document, ObjectId } from "mongodb";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord.js";
import db from "../database/index.js";
import { Constants } from "../utility/Constants.js";
import { handleError } from "../utility/Logger.js";
import { modLog } from "../services/ModerationService.js";
import { getDisplayTag, getUserTag } from "../utility/StringUtil.js";
import TryVal from "../utility/TryVal.js";

setInterval(() => {
  (async function run() {
    const puns = (await db.punRepo?.findMany()) as Array<Document>;

    const punsPromises = puns.map(async (pun) => {
      if (Date.now() > pun.punishedAt + pun.punLength) {
        const guild = await TryVal(
          container.client.guilds.fetch(pun.guildId as Snowflake),
        );

        if (guild != null) {
          const targetUser = await TryVal(
            container.client.users.fetch(pun.userId as Snowflake),
          );

          if (targetUser != null) {
            const targetMember = await TryVal(
              guild.members.fetch(pun.userId as Snowflake),
            );

            await db.userRepo?.upsertUser(pun.userId as Snowflake, guild.id, {
              $inc: {
                currentPunishment: -(pun.amount == null ? 1 : pun.amount),
              },
            });
            await db.punRepo?.deleteById(pun._id as ObjectId);
            await modLog(
              guild,
              null,
              [
                "Action",
                "Automatic Punishment Removal",
                targetMember == null ? "User" : "Member",
                targetMember == null
                  ? `${getUserTag(targetUser)} (${targetUser.id})`
                  : `${getDisplayTag(targetMember)} (${targetMember.user.id})`,
              ],
              Constants.UNMUTE_COLOR,
              targetUser,
            );
          }
        }
      }
    });

    await Promise.all(punsPromises);
  })().catch((err) => handleError(err));
}, Constants.INTERVALS.AUTO_PUNISHMENT_REMOVAL);
