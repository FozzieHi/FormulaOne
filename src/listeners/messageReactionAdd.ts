import { Listener } from "@sapphire/framework";
import { MessageReaction } from "discord.js";
import { FilterService } from "../services/FilterService";

export class MessageReactionAddListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(reaction: MessageReaction) {
    await FilterService.checkEmotes(reaction);
  }
}
