import { GuildMember } from "discord.js";
import { Listener } from "@sapphire/framework";
import ProtectionService from "../services/ProtectionService.js";

export class GuildMemberAddListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(member: GuildMember) {
    await ProtectionService.checkJoins(member.guild);
  }
}
