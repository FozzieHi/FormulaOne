import { ChatInputCommandErrorPayload, Listener } from "@sapphire/framework";
import Sentry from "@sentry/node";
import { replyInteractionError } from "../utility/Sender.js";
import Try from "../utility/Try.js";

export class ChatInputCommandErrorListener extends Listener {
  public async run(error: Error, { interaction }: ChatInputCommandErrorPayload) {
    await Try(replyInteractionError(interaction, error?.message));
    this.container.logger.error(
      `Unsuccessful (error) command result - ${interaction.user.tag} - ${interaction.commandName} - ${error.message}`
    );
    Sentry.captureException(error);
  }
}
