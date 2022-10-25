import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { BotQueueService } from "../services/BotQueueService";

export class MessageUpdateListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(oldMessage: Message, newMessage: Message) {
    await BotQueueService.checkMessage(newMessage);
  }
}
