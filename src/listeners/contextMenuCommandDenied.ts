import {
  ContextMenuCommandDeniedPayload,
  Listener,
  UserError,
} from "@sapphire/framework";
import { replyInteractionError } from "../utility/Sender.js";
import { getUserTag } from "../utility/StringUtil.js";

export class ContextMenuCommandDeniedListener extends Listener {
  public async run(error: UserError, { interaction }: ContextMenuCommandDeniedPayload) {
    await replyInteractionError(interaction, error.message);
    this.container.logger.info(
      `Unsuccessful (denied) context menu result - ${getUserTag(interaction.user)} - ${
        interaction.commandName
      } - ${error.message}`,
    );
  }
}
