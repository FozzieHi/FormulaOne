import {
  ChatInputCommandDeniedPayload,
  Listener,
  UserError,
} from "@sapphire/framework";
import { replyInteractionError } from "../utility/Sender";

export class ApplicationCommandDeniedListener extends Listener {
  public async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    await replyInteractionError(interaction, error.message);
    this.container.logger.info(
      `Unsuccessful command result - ${interaction.user.tag} - ${error.message}`
    );
  }
}
