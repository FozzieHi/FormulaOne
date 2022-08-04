import { Invite, Message } from "discord.js";
import { container } from "@sapphire/framework";
import { Constants, ModerationQueueButtons } from "../utility/Constants";
import { modQueue } from "./ModerationService";
import Try from "../utility/Try";
import TryVal from "../utility/TryVal";

export class FilterService {
  public static async checkInvites(message: Message): Promise<boolean> {
    const inviteMatch = Constants.REGEXES.INVITES.match(message.content);
    if (inviteMatch == null || message.guild == null) {
      return false;
    }
    const inviteCode = inviteMatch[2];
    const invite = (await TryVal(container.client.fetchInvite(inviteCode))) as Invite;
    if (invite == null || invite.guild == null) {
      return false;
    }
    if (invite.guild.id === Constants.GUILD_IDS[0]) {
      return false;
    }
    await Try(message.delete());
    await modQueue(
      message.guild,
      message.author,
      message.channel.id,
      message.id,
      [
        "Filter Name",
        "Invites",
        "Invite Server",
        `${invite.guild.name} (${invite.guild.id})`,
        "Channel",
        message.channel.toString(),
        "Content",
        message.content,
      ],
      Constants.KICK_COLOR,
      [ModerationQueueButtons.PUNISH, ModerationQueueButtons.IGNORE]
    );
    return true;
  }
}
