import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { filterCheckMessage } from "../services/BotQueueService.js";
import { genericLog } from "../services/ModerationService.js";
import { Constants } from "../utility/Constants.js";
import { getOverflowFields } from "../utility/StringUtil.js";

export class MessageUpdateListener extends Listener {
  public async run(oldMessage: Message, newMessage: Message) {
    if (oldMessage.content !== newMessage.content) {
      await filterCheckMessage(newMessage);

      const { member } = newMessage;
      if (member != null) {
        await genericLog(
          member.guild,
          member,
          [
            "Action",
            `Message Edit [Jump to message](${newMessage.url})`,
            ...getOverflowFields("Before", oldMessage.content),
            ...getOverflowFields("After", newMessage.content),
            "Channel",
            newMessage.channel.toString(),
          ],
          Constants.LIGHT_ORANGE_COLOR,
          newMessage.id,
        );
      }
    }
  }
}
