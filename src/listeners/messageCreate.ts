import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { filterCheckMessage } from "../services/BotQueueService.js";

export class MessageCreateListener extends Listener {
  public async run(message: Message) {
    await filterCheckMessage(message);
  }
}
