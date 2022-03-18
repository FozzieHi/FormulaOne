import { ChatInputCommandSuccessPayload, Listener } from "@sapphire/framework";

export class ChatInputCommandSuccessListener extends Listener {
  public async run({ context, interaction }: ChatInputCommandSuccessPayload) {
    this.container.logger.info(
      `Successful command result - ${interaction.user.tag} - ${context.commandName}`
    );
  }
}
