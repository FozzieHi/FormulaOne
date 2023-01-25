import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { filterCheckMessage } from "../services/BotQueueService.js";
import { Constants } from "../utility/Constants.js";
import { addDiscussionEmotes } from "../utility/DiscussionService.js";

export class MessageCreateListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(message: Message) {
    await filterCheckMessage(message);
    if (message.channel.id === Constants.CHANNELS.F1_DISCUSSION) {
      await addDiscussionEmotes(message);
    }
  }
}
