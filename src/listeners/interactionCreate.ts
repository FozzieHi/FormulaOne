import { Listener } from "@sapphire/framework";
import { Interaction } from "discord.js";

export class InteractionCreateListener extends Listener {
  public async run(interaction: Interaction) {
    if (interaction.isButton()) {
      if (interaction.customId.startsWith("userid-")) {
        const userId = interaction.customId.split("userid-")[1];
        await interaction.reply({ content: userId, ephemeral: true });
      }
    }
  }
}
