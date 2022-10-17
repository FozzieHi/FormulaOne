import { Listener } from "@sapphire/framework";
import { Guild, MessageReaction, User } from "discord.js";
import { FilterService } from "../services/FilterService";
import { Constants } from "../utility/Constants";
import { ModerationService } from "../services/ModerationService";

export class MessageReactionAddListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(reaction: MessageReaction) {
    const message = reaction.message.partial
      ? await reaction.message.fetch()
      : reaction.message;
    if (
      await ModerationService.isModerator(
        reaction.message.guild as Guild,
        reaction.message.author as User
      )
    ) {
      return;
    }
    if (reaction.emoji.id === Constants.EMOTE_ID) {
      await FilterService.checkEmotes(message);
    }
  }
}
