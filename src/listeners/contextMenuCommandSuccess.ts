import { ContextMenuCommandSuccessPayload, Listener } from "@sapphire/framework";

export class ContextMenuCommandSuccessListener extends Listener {
  public async run({ context, interaction }: ContextMenuCommandSuccessPayload) {
    this.container.logger.info(
      `Successful command result - ${interaction.user.tag} - ${context.commandName}`
    );
  }
}
