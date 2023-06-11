import {
  ChatInputCommandDeniedPayload,
  Listener,
  UserError,
} from "@sapphire/framework";
import { replyInteractionError } from "../utility/Sender.js";
import { getUserTag } from "../utility/StringUtil.js";

export class ChatInputCommandDeniedListener extends Listener {
  public async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    await replyInteractionError(interaction, error.message);
    this.container.logger.info(
      `Unsuccessful (denied) command result - ${getUserTag(interaction.user)} - ${
        interaction.commandName
      } - ${error.message}`
    );
  }
}
