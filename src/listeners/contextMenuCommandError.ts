import {
  ContextMenuCommandErrorPayload,
  Listener,
  UserError,
} from "@sapphire/framework";
import { replyInteractionError } from "../utility/Sender";

export class ContextMenuCommandErrorListener extends Listener {
  public async run(error: UserError, { interaction }: ContextMenuCommandErrorPayload) {
    await replyInteractionError(interaction, error.message);
    this.container.logger.info(
      `Unsuccessful (error) context menu result - ${interaction.user.tag} - ${interaction.commandName} - ${error.message}`
    );
  }
}
