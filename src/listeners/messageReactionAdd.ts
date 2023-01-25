import { Listener } from "@sapphire/framework";
import { MessageReaction } from "discord.js";
import { checkEmotes } from "../services/FilterService.js";
import { checkDiscussionEmotes } from "../utility/DiscussionService.js";

export class MessageReactionAddListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(reaction: MessageReaction) {
    const message = reaction.message.partial
      ? await reaction.message.fetch()
      : reaction.message;

    await checkEmotes(message, reaction);
    await checkDiscussionEmotes(message, reaction);
  }
}
