import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { debugFilterLog, filterCheckMessage } from "../services/BotQueueService.js";
import { handleMessageExperience } from "../services/ExperienceService.js";

export class MessageCreateListener extends Listener {
  /*
    raw.ts also processes some MESSAGE_CREATE events
   */
  public async run(message: Message) {
    await filterCheckMessage(message);
    await handleMessageExperience(message);
    debugFilterLog(message);
  }
}
