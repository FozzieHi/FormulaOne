import { ChatInputCommandSuccessPayload, Listener } from "@sapphire/framework";
import { getUserTag } from "../utility/StringUtil.js";

export class ChatInputCommandSuccessListener extends Listener {
  public async run({ context, interaction }: ChatInputCommandSuccessPayload) {
    this.container.logger.info(
      `Successful command result - ${getUserTag(interaction.user)} - ${
        context.commandName
      }`,
    );
  }
}
