import { Guild, Invite, Message } from "discord.js";
import { container } from "@sapphire/framework";
import { Constants, ModerationQueueButtons } from "../utility/Constants";
import { modQueue } from "./ModerationService";
import Try from "../utility/Try";
import TryVal from "../utility/TryVal";
import { StringUtil } from "../utility/StringUtil";
import ViolationService from "./ViolationService";
import MutexManager from "../managers/MutexManager";

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
    const messages = await message.channel.messages.fetch({ limit: 2 });
    const aboveMessage = messages.last()?.url;
    await modQueue(
      message.guild,
      message.author,
      message.channel.id,
      message.id,
      [
        "Action",
        `Filter Trigger${
          aboveMessage != null ? ` [Jump to message above](${aboveMessage})` : ""
        }`,
        "Filter Name",
        "Invites",
        "Invite Server",
        `${invite.guild.name} (${invite.guild.id})`,
        "Channel",
        message.channel.toString(),
        "Content",
        StringUtil.removeClickableLinks(message.content),
      ],
      Constants.KICK_COLOR,
      [
        ModerationQueueButtons.PUNISH,
        ModerationQueueButtons.ESCALATE,
        ModerationQueueButtons.IGNORE,
      ]
    );
    return true;
  }

  public static async checkEmotes(message: Message) {
    let score = 0;
    const users = await message.reactions.cache
      .find((reaction) => reaction.emoji.id === Constants.EMOTE_ID)
      ?.users.fetch();
    users?.forEach((user) => {
      score += Constants.EMOTE_SCORES.find((val) => val.id === user.id)?.score ?? 0.05;
    });
    if (score >= 0.25) {
      await MutexManager.getUserPublicMutex(message.author.id).runExclusive(
        async () => {
          await modQueue(
            message.guild as Guild,
            message.author,
            message.channel.id,
            message.id,
            [
              "Action",
              `Emote report [Jump to message](${message.url})`,
              "Report Score",
              score.toString(),
              "Channel",
              message.channel.toString(),
              "Content",
              message.content,
            ],
            Constants.WARN_COLOR,
            [
              ModerationQueueButtons.PUNISH,
              ModerationQueueButtons.ESCALATE,
              ModerationQueueButtons.IGNORE,
            ],
            `<@&${Constants.ROLES.MODS}>`
          );
          ViolationService.reports.push({
            channelId: message.channel.id,
            messageId: message.id,
          });
        }
      );
    }
  }
}
