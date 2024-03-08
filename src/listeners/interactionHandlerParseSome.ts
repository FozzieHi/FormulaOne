import { InteractionHandlerParseSome, Listener, Option } from "@sapphire/framework";
import MutexManager from "../managers/MutexManager.js";

export class InteractionHandlerParseSomeListener extends Listener {
  public async run(
    option: Option.Some<unknown>,
    { interaction }: InteractionHandlerParseSome,
  ) {
    if (interaction.isCommand()) {
      await MutexManager.getInteractionMutex(interaction.id).runExclusive(async () => {
        await interaction.deferReply({ ephemeral: true });
      });
    }
    if (
      interaction.isMessageComponent() ||
      interaction.isModalSubmit() ||
      interaction.isStringSelectMenu()
    ) {
      if (
        interaction.customId.startsWith("showreasonoption-") ||
        interaction.customId.startsWith("addremoveoption-")
      ) {
        return;
      }
      await MutexManager.getInteractionMutex(interaction.id).runExclusive(async () => {
        if (this.container.client.user?.id === interaction.message?.author.id) {
          await interaction.deferUpdate();
        } else {
          await interaction.deferReply({ ephemeral: true });
        }
      });
    }
  }
}
