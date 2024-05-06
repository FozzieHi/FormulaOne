import { Precondition } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  Guild,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import Try from "../../utility/Try.js";

export class MemberValidationPrecondition extends Precondition {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("member");
    return target != null ? this.ok() : this.error({ message: "Member not found." });
  }

  public async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    return interaction.targetMessage != null &&
      (await Try(
        (interaction.guild as Guild).members.fetch(interaction.targetMessage.author.id),
      ))
      ? this.ok()
      : this.error({ message: "Member not found." });
  }
}
