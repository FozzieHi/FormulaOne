import { Command, Precondition } from "@sapphire/framework";
import { ChatInputCommandInteraction, Guild } from "discord.js";
import Try from "../../utility/Try.js";
import ContextMenuCommandInteraction = Command.ContextMenuCommandInteraction;

export class MemberValidationPrecondition extends Precondition {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("member");
    return target != null ? this.ok() : this.error({ message: "Member not found." });
  }

  public async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    const message = interaction.options.getMessage("message");
    return message != null &&
      (await Try((interaction.guild as Guild).members.fetch(message.author.id)))
      ? this.ok()
      : this.error({ message: "Member not found." });
  }
}
