import { Guild, Invite, Message, MessageReaction, User } from "discord.js";
import { container } from "@sapphire/framework";
import { Constants, ModerationQueueButtons } from "../utility/Constants";
import { ModerationService, modQueue } from "./ModerationService";
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

  public static async checkEmotes(reaction: MessageReaction) {
    await MutexManager.getUserPublicMutex(
      (reaction.message.author as User)?.id
    ).runExclusive(async () => {
      if (
        ViolationService.reports.some(
          (report) =>
            report.channelId === reaction.message.channel.id &&
            report.messageId === reaction.message.id
        )
      ) {
        return;
      }
      const message = reaction.message.partial
        ? await reaction.message.fetch()
        : reaction.message;
      if (
        await ModerationService.isModerator(
          reaction.message.guild as Guild,
          reaction.message.author as User
        )
      ) {
        return;
      }
      if (reaction.emoji.id === Constants.EMOTE_ID) {
        let score = 0;
        const users = await message.reactions.cache
          .find((msgReaction) => msgReaction.emoji.id === Constants.EMOTE_ID)
          ?.users.fetch();
        users?.forEach((user) => {
          score +=
            Constants.EMOTE_SCORES.find((val) => val.id === user.id)?.score ?? 0.05;
        });
        if (score >= 0.25) {
          await modQueue(
            message.guild as Guild,
            message.author,
            message.channel.id,
            message.id,
            [
              "Action",
              `Emote Report [Jump to message](${message.url})`,
              "Score",
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
            true
          );
          ViolationService.reports.push({
            channelId: message.channel.id,
            messageId: message.id,
          });
        }
      }
    });
  }
}
