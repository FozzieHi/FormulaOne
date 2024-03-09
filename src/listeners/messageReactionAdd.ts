import { Listener } from "@sapphire/framework";
import { MessageReaction } from "discord.js";
import { checkEmotes } from "../services/FilterService.js";
import { checkDiscussionEmotes } from "../utility/DiscussionService.js";
import TryVal from "../utility/TryVal.js";

export class MessageReactionAddListener extends Listener {
  public async run(reaction: MessageReaction) {
    const message = reaction.message.partial
      ? await TryVal(reaction.message.fetch())
      : reaction.message;
    if (message == null) {
      return;
    }

    await checkEmotes(message, reaction);
    await checkDiscussionEmotes(message, reaction);
  }
}
