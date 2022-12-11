import {
  Guild,
  Message,
  MessageButton,
  TextChannel,
  ThreadChannel,
  User,
} from "discord.js";
import { Constants } from "../utility/Constants.js";
import { checkInvites } from "./FilterService.js";
import ViolationService from "./ViolationService.js";
import { boldify } from "../utility/StringUtil.js";
import { getPermLevel } from "./ModerationService.js";
import TryVal from "../utility/TryVal.js";

export async function checkMessage(message: Message) {
  if (
    message.guild == null ||
    (await getPermLevel(message.guild, message.author)) > 0
  ) {
    return;
  }
  const result = await checkInvites(message);
  if (result) {
    await ViolationService.checkViolations(message);
  }
}

export async function archiveLog(
  guild: Guild,
  channel: TextChannel,
  targetUserId: string,
  moderator: User | null,
  message: Message,
  action: string
): Promise<Message | null> {
  const modQueueChannel = (await TryVal(
    guild.channels.fetch(Constants.CHANNELS.MOD_QUEUE)
  )) as TextChannel;
  const messageEmbed = message.embeds.at(0);
  if (modQueueChannel == null || messageEmbed == null) {
    return null;
  }
  const archiveThread = (await TryVal(
    modQueueChannel.threads.fetch(Constants.CHANNELS.MOD_QUEUE_ARCHIVE)
  )) as ThreadChannel;
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
    }${action}${moderator != null ? ` by ${boldify(moderator.tag)}` : ""}`,
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
