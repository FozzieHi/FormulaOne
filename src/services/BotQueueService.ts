import { Guild, Message, MessageButton, TextChannel, User } from "discord.js";
import { Constants } from "../utility/Constants.js";
import { StringUtil } from "../utility/StringUtil.js";
import { FilterService } from "./FilterService.js";
import ViolationService from "./ViolationService.js";
import { ModerationService } from "./ModerationService.js";

export class BotQueueService {
  public static async checkMessage(message: Message) {
    if (
      message.guild == null ||
      (await ModerationService.getPermLevel(message.guild, message.author)) > 0
    ) {
      return;
    }
    const result = await FilterService.checkInvites(message);
    if (result) {
      await ViolationService.checkViolations(message);
    }
  }

  public static async archiveLog(
    guild: Guild,
    channel: TextChannel,
    targetUserId: string,
    moderator: User | null,
    message: Message,
    action: string
  ): Promise<Message | null> {
    const modQueueChannel = guild.channels.cache.get(
      Constants.CHANNELS.MOD_QUEUE
    ) as TextChannel;
    const messageEmbed = message.embeds.at(0);
    if (messageEmbed == null) {
      return null;
    }
    const archiveThread = modQueueChannel.threads.cache.get(
      Constants.CHANNELS.MOD_QUEUE_ARCHIVE
    );
    if (archiveThread == null) {
      return null;
    }

    const buttons = [
      [
        new MessageButton({
          customId: `userid-${targetUserId}`,
          label: `User ID`,
          style: "SECONDARY",
        }),
      ],
    ];

    const messageSent = await archiveThread.send({
      content: `${
        channel.id === Constants.CHANNELS.STEWARDS_QUEUE ? "Escalation result - " : ""
      }${action}${moderator != null ? ` by ${StringUtil.boldify(moderator.tag)}` : ""}`,
      embeds: [messageEmbed],
      components: buttons.map((button) => ({
        type: "ACTION_ROW",
        components: button,
      })),
    });
    if (messageSent) {
      await message.delete();
    }
    return messageSent;
  }
}
