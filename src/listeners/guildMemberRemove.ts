import { GuildMember } from "discord.js";
import { Listener } from "@sapphire/framework";
import { Constants } from "../utility/Constants.js";
import { genericLog } from "../services/ModerationService.js";

export class GuildMemberRemoveListener extends Listener {
  public async run(member: GuildMember) {
    await genericLog(
      member.guild,
      member,
      ["Action", "Left the server", "Members now", member.guild.memberCount.toString()],
      Constants.LIGHT_ORANGE_COLOR,
    );
  }
}
