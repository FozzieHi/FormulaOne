import { IInteractionHandlerPayload, Listener } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";
import { captureException } from "@sentry/node";
import { replyInteractionError } from "../utility/Sender.js";
import Try from "../utility/Try.js";

export class InteractionHandlerErrorListener extends Listener {
  public async run(error: Error, { interaction }: IInteractionHandlerPayload) {
    if (interaction != null && !(interaction as CommandInteraction).replied) {
      await Try(replyInteractionError(interaction as never, error.message));
    }
    captureException(error);
  }
}
