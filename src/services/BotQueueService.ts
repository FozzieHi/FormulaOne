import {
  Guild,
  Message,
  ButtonBuilder,
  TextChannel,
  ThreadChannel,
  ButtonStyle,
  ComponentType,
  GuildMember,
  GuildTextBasedChannel,
} from "discord.js";
import { container } from "@sapphire/framework";
import { Constants } from "../utility/Constants.js";
import { checkInvites, checkOneWord, checkYouTubeChannel } from "./FilterService.js";
import ViolationService from "./ViolationService.js";
import { boldify, getDisplayTag, replaceNonAscii } from "../utility/StringUtil.js";
import { isModerator } from "./ModerationService.js";
import TryVal from "../utility/TryVal.js";
import Try from "../utility/Try.js";

export async function filterCheckMessage(message: Message) {
  if (message.guild == null || (await isModerator(message.guild, message.author))) {
    return;
  }
  await checkOneWord(message);
  const result = await checkInvites(message);
  await checkYouTubeChannel(message);
  if (result) {
    await ViolationService.checkViolations(
      message.guild,
      message.channel as GuildTextBasedChannel,
      message.member as GuildMember,
      message.id,
      "AUTOMOD",
    );
  }
}

export function debugFilterLog(message: Message) {
  Constants.DEBUG_REGEXES.filter((regex) => regex.test(message.content)).forEach(
    (regex) =>
      container.logger.info(`${regex.source} - ${replaceNonAscii(message.content)}`),
  );
}

export async function archiveLog(
  guild: Guild,
  channel: TextChannel,
  targetUserId: string,
  moderator: GuildMember | null,
  message: Message,
  action: string,
): Promise<Message | null> {
  const modQueueChannel = (await TryVal(
    guild.channels.fetch(Constants.CHANNELS.MOD_QUEUE),
  )) as TextChannel;
  const EmbedBuilder = message.embeds.at(0);
  if (modQueueChannel == null || EmbedBuilder == null) {
    return null;
  }
  const archiveThread = (await TryVal(
    modQueueChannel.threads.fetch(Constants.CHANNELS.MOD_QUEUE_ARCHIVE),
  )) as ThreadChannel;
  if (archiveThread == null) {
    return null;
  }

  const buttons = [
    [
      new ButtonBuilder({
        customId: `id-${targetUserId}`,
        label: `User ID`,
        style: ButtonStyle.Secondary,
      }),
    ],
  ];

  const messageSent = await archiveThread.send({
    content: `${
      channel.id === Constants.CHANNELS.STEWARDS_QUEUE ? "Escalation result - " : ""
    }${action}${moderator != null ? ` by ${boldify(getDisplayTag(moderator))}` : ""}`,
    embeds: [EmbedBuilder],
    components: buttons.map((button) => ({
      type: ComponentType.ActionRow,
      components: button,
    })),
  });
  if (messageSent) {
    await Try(message.delete());
  }
  return messageSent;
}
