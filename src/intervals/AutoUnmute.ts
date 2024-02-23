/* eslint-disable no-await-in-loop */
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
    const mutes = (await db.muteRepo?.findMany()) as Array<Document>;

    for (let i = 0; i < mutes.length; i += 1) {
      const mute = mutes[i];

      if (Date.now() > mute.mutedAt + mute.muteLength) {
        const guild = await TryVal(
          container.client.guilds.fetch(mute.guildId as Snowflake),
        );

        if (guild != null) {
          const targetUser = await TryVal(
            container.client.users.fetch(mute.userId as Snowflake),
          );
          if (targetUser != null) {
            const targetMember = await TryVal(
              guild.members.fetch(mute.userId as Snowflake),
            );

            if (targetMember != null) {
              await targetMember.roles.remove(Constants.ROLES.MUTED);
            }
            await db.muteRepo?.deleteById(mute._id as ObjectId);
            await modLog(
              guild,
              null,
              [
                "Action",
                "Automatic Unmute",
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
    }
  })().catch((err) => handleError(err));
}, Constants.INTERVALS.AUTO_UNMUTE);
