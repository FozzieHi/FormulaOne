import { IInteractionHandlerPayload, Listener } from "@sapphire/framework";
import Sentry from "@sentry/node";
import { CommandInteraction } from "discord.js";
import { replyInteractionError } from "../utility/Sender.js";

export class InteractionHandlerErrorListener extends Listener {
  public async run(error: Error, { interaction }: IInteractionHandlerPayload) {
    if (!(interaction as CommandInteraction)?.replied) {
      await replyInteractionError(interaction as never, error.message);
    }
    Sentry.captureException(error);
  }
}
