import { Listener } from "@sapphire/framework";
import { GuildTextBasedChannel, Message, AuditLogEvent } from "discord.js";
import { genericLog } from "../services/ModerationService.js";
import { Constants } from "../utility/Constants.js";
import TryVal from "../utility/TryVal.js";
import { getDisplayTag, maxLength } from "../utility/StringUtil.js";

export class MessageDeleteListener extends Listener {
  public async run(message: Message) {
    const { member } = message;
    if (member != null && !member.user.bot && message.guild != null) {
      const auditLog = await TryVal(
        message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 })
      );
      const auditMessage = auditLog?.entries.first();
      const messages = await TryVal(
        (message.channel as GuildTextBasedChannel).messages.fetch({ limit: 2 })
      );
      const aboveMessage = messages?.last()?.url;

      const fieldsAndValues = [
        "Action",
        `Message Deletion${
          aboveMessage != null ? ` [Jump to message above](${aboveMessage})` : ""
        }`,
        "Content",
        maxLength(message.content),
        "Channel",
        message.channel.toString(),
      ];
      if (
        auditMessage != null &&
        auditMessage.extra.channel.id === message.channel.id &&
        auditMessage.target.id === message.author.id &&
        Date.now() - auditMessage.createdTimestamp < 5000 &&
        auditMessage.extra.count >= 1 &&
        auditMessage.executor != null
      ) {
        const moderator = await TryVal(
          message.guild.members.fetch(auditMessage.executor)
        );
        if (moderator != null) {
          fieldsAndValues.push("Deleted By");
          fieldsAndValues.push(`${getDisplayTag(moderator)} (${moderator.id})`);
        }
      }

      await genericLog(
        member.guild,
        member,
        fieldsAndValues,
        Constants.ORANGE_COLOR,
        message.id
      );
    }
  }
}
