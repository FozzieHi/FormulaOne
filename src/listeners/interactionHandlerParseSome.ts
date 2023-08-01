import { InteractionHandlerParseSome, Listener, Option } from "@sapphire/framework";

export class InteractionHandlerParseSomeListener extends Listener {
  public async run(
    option: Option.Some<unknown>,
    { interaction }: InteractionHandlerParseSome,
  ) {
    if (interaction.isMessageComponent()) {
      await interaction.deferReply({ ephemeral: true });
    }
  }
}
