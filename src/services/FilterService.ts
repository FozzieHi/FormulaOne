import { Message } from "discord.js";
import { container } from "@sapphire/framework";
import { Constants, ModerationQueueButtons } from "../utility/Constants";
import { modQueue } from "./ModerationService";
import Try from "../utility/Try";

export class FilterService {
  public static async checkInvites(message: Message) {
    const inviteMatch = Constants.REGEXES.INVITES.match(message.content);
    if (inviteMatch == null || message.guild == null) {
      return false;
    }
    const inviteCode = inviteMatch[2];
    const invite = await container.client.fetchInvite(inviteCode);
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
        "Invite Code",
        inviteCode,
        "Server Name",
        invite.guild.name,
        "Content",
        message.content,
      ],
      Constants.KICK_COLOR,
      [ModerationQueueButtons.PUNISH, ModerationQueueButtons.IGNORE]
    );
    return true;
  }
}
