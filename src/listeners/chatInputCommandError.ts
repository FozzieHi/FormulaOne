import { ChatInputCommandErrorPayload, Listener, UserError } from "@sapphire/framework";
import { replyInteractionError } from "../utility/Sender";

export class ChatInputCommandDeniedListener extends Listener {
  public async run(error: UserError, { interaction }: ChatInputCommandErrorPayload) {
    await replyInteractionError(interaction, error.message);
    this.container.logger.info(
      `Unsuccessful (error) command result - ${interaction.user.tag} - ${interaction.commandName} - ${error.message}`
    );
  }
}
