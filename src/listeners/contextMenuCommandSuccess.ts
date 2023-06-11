import { ContextMenuCommandSuccessPayload, Listener } from "@sapphire/framework";
import { getUserTag } from "../utility/StringUtil.js";

export class ContextMenuCommandSuccessListener extends Listener {
  public async run({ context, interaction }: ContextMenuCommandSuccessPayload) {
    this.container.logger.info(
      `Successful context menu result - ${getUserTag(interaction.user)} - ${
        context.commandName
      }`
    );
  }
}
