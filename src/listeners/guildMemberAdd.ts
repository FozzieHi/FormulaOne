import { GuildMember, GuildTextBasedChannel } from "discord.js";
import { Listener } from "@sapphire/framework";
import ProtectionService from "../services/ProtectionService.js";
import { send } from "../utility/Sender.js";
import { boldify, getDisplayTag } from "../utility/StringUtil.js";
import { Constants } from "../utility/Constants.js";
import TryVal from "../utility/TryVal.js";
import { genericLog } from "../services/ModerationService.js";

export class GuildMemberAddListener extends Listener {
  public async run(member: GuildMember) {
    await ProtectionService.checkJoins(member.guild);

    await genericLog(
      member.guild,
      member,
      [
        "Action",
        "Joined the server",
        "Members now",
        member.guild.memberCount.toString(),
      ],
      Constants.GREEN_COLOR
    );

    const welcomeChannel = (await TryVal(
      member.guild.channels.fetch(Constants.CHANNELS.WELCOME)
    )) as GuildTextBasedChannel;
    if (welcomeChannel != null) {
      await send(
        welcomeChannel,
        `Hello ${boldify(
          getDisplayTag(member)
        )}, welcome to the r/formula1 Discord server!` +
          ` You should be given access to the server after you read and agree to the <#${Constants.CHANNELS.RULES}>.` +
          `\n\nDM <@${Constants.BOTS.MOD_MAIL}> if you have issues after verifying and refreshing your browser / restarting the app.` +
          `\n\nSay hi in <#${Constants.CHANNELS.OFF_TOPIC}> or dive right into F1 chat in <#${Constants.CHANNELS.F1_GENERAL}>. We look forward to talking to you.`
      );
    }
  }
}
