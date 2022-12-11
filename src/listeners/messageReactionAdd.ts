import { Listener } from "@sapphire/framework";
import { MessageReaction } from "discord.js";
import { checkEmotes } from "../services/FilterService.js";

export class MessageReactionAddListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(reaction: MessageReaction) {
    await checkEmotes(reaction);
  }
}
