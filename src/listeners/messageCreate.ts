import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { BotQueueService } from "../services/BotQueueService.js";

export class MessageCreateListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(message: Message) {
    await BotQueueService.checkMessage(message);
  }
}
