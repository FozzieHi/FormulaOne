import { GuildMember } from "discord.js";
import { Listener } from "@sapphire/framework";
import { Constants } from "../utility/Constants.js";
import { genericLog } from "../services/ModerationService.js";
import db from "../database/index.js";

export class GuildMemberRemoveListener extends Listener {
  public async run(member: GuildMember) {
    await db.userRepo?.upsertUser(member.id, member.guild.id, {
      $set: {
        leftRoles: [...member.roles.cache.keys()].filter(
          (roleId) => roleId !== member.guild.id,
        ),
      },
    }); // Map to role ID and filter out the @everyone role.

    await genericLog(
      member.guild,
      member,
      ["Action", "Left the server", "Members now", member.guild.memberCount.toString()],
      Constants.LIGHT_ORANGE_COLOR,
    );
  }
}
