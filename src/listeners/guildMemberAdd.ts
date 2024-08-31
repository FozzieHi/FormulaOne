import { GuildMember, GuildTextBasedChannel } from "discord.js";
import { Listener } from "@sapphire/framework";
import ProtectionService from "../services/ProtectionService.js";
import { send } from "../utility/Sender.js";
import { boldify, getDisplayTag } from "../utility/StringUtil.js";
import { Constants } from "../utility/Constants.js";
import TryVal from "../utility/TryVal.js";
import { genericLog } from "../services/ModerationService.js";
import { getDBGuild, getDBUser } from "../utility/DatabaseUtil.js";
import db from "../database/index.js";

export class GuildMemberAddListener extends Listener {
  public async run(member: GuildMember) {
    await ProtectionService.checkJoins(member.guild);

    const dbUser = await getDBUser(member.id, member.guild.id);
    const dbGuild = await getDBGuild(member.guild.id);
    if (dbGuild == null) {
      return;
    }

    if (dbUser?.leftRoles != null) {
      const promises = dbUser.leftRoles.map(async (roleId) => {
        const role = await TryVal(member.guild.roles.fetch(roleId));
        if (role != null && role.id !== dbGuild.roles.muted) {
          return member.roles.add(role.id);
        }
        return null;
      });

      await Promise.all(promises);
    }

    if (
      dbGuild.roles.muted != null &&
      (await db.muteRepo?.anyMute(member.id, member.guild.id))
    ) {
      const role = await TryVal(member.guild.roles.fetch(dbGuild.roles.muted));

      if (role != null) {
        await member.roles.add(role);
      }
    }

    await genericLog(
      member.guild,
      member,
      [
        "Action",
        "Joined the server",
        "Members now",
        member.guild.memberCount.toString(),
      ],
      Constants.GREEN_COLOR,
    );

    const welcomeChannel = (await TryVal(
      member.guild.channels.fetch(Constants.CHANNELS.WELCOME),
    )) as GuildTextBasedChannel;
    if (welcomeChannel != null) {
      await send(
        welcomeChannel,
        `Hello ${boldify(
          getDisplayTag(member),
        )}, welcome to the r/formula1 Discord server!` +
          ` You should be given access to the server after you read and agree to the <#${Constants.CHANNELS.RULES}>.` +
          `\n\nDM <@${Constants.BOTS.MOD_MAIL}> if you have issues after verifying and refreshing your browser / restarting the app.` +
          `\n\nSay hi in <#${Constants.CHANNELS.OFF_TOPIC}> or dive right into F1 chat in <#${Constants.CHANNELS.F1_GENERAL}>. We look forward to talking to you.`,
      );
    }
  }
}
