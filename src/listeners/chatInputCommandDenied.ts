import {
  ChatInputCommandDeniedPayload,
  Listener,
  UserError,
} from "@sapphire/framework";
import { replyInteractionError } from "../utility/Sender.js";

export class ChatInputCommandDeniedListener extends Listener {
  public async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    await replyInteractionError(interaction, error.message);
    this.container.logger.info(
      `Unsuccessful (denied) command result - ${interaction.user.tag} - ${interaction.commandName} - ${error.message}`
    );
  }
}
