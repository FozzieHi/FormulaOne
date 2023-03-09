import { IInteractionHandlerPayload, Listener } from "@sapphire/framework";
import Sentry from "@sentry/node";
import { CommandInteraction } from "discord.js";
import { replyInteractionError } from "../utility/Sender.js";
import Try from "../utility/Try.js";

export class InteractionHandlerErrorListener extends Listener {
  public async run(error: Error, { interaction }: IInteractionHandlerPayload) {
    if (interaction != null && !(interaction as CommandInteraction).replied) {
      await Try(replyInteractionError(interaction as never, error.message));
    }
    Sentry.captureException(error);
  }
}
