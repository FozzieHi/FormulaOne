import { ContextMenuCommandErrorPayload, Listener } from "@sapphire/framework";
import Sentry from "@sentry/node";
import { replyInteractionError } from "../utility/Sender.js";

export class ContextMenuCommandErrorListener extends Listener {
  public async run(error: Error, { interaction }: ContextMenuCommandErrorPayload) {
    await replyInteractionError(interaction, error.message);
    this.container.logger.error(
      `Unsuccessful (error) context menu result - ${interaction.user.tag} - ${interaction.commandName} - ${error.message}`
    );
    Sentry.captureException(error);
  }
}
