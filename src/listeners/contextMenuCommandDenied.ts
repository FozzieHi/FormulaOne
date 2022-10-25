import {
  ContextMenuCommandDeniedPayload,
  Listener,
  UserError,
} from "@sapphire/framework";
import { replyInteractionError } from "../utility/Sender.js";

export class ContextMenuCommandDeniedListener extends Listener {
  public async run(error: UserError, { interaction }: ContextMenuCommandDeniedPayload) {
    await replyInteractionError(interaction, error.message);
    this.container.logger.info(
      `Unsuccessful (denied) context menu result - ${interaction.user.tag} - ${interaction.commandName} - ${error.message}`
    );
  }
}
