import { GuildTextBasedChannel, Message } from "discord.js";
import { Constants } from "../utility/Constants.js";
import { ban } from "../utility/BanUtil.js";
import { isModerator } from "./ModerationService.js";

export async function honeypotCheck(message: Message) {
  if (message.channelId !== Constants.CHANNELS.HONEYPOT) {
    return;
  }
  if (message.member === null || message.guild === null) {
    return;
  }

  if (await isModerator(message.guild, message.author)) {
    return;
  }

  await ban(
    message.guild,
    message.author,
    null,
    "Posted in the Honeypot Channel.",
    message.channel as GuildTextBasedChannel,
    undefined,
    3600,
  );
}
