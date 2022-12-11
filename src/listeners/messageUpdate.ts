import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { checkMessage } from "../services/BotQueueService.js";

export class MessageUpdateListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(oldMessage: Message, newMessage: Message) {
    if (oldMessage.content !== newMessage.content) {
      await checkMessage(newMessage);
    }
  }
}
