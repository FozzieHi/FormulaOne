import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { filterCheckMessage } from "../services/BotQueueService.js";

export class MessageCreateListener extends Listener {
  /*
    raw.ts also processes some MESSAGE_CREATE events
   */
  public async run(message: Message) {
    await filterCheckMessage(message);
  }
}
