import { Command, Precondition } from "@sapphire/framework";
import { CommandInteraction, Guild } from "discord.js";
import Try from "../../utility/Try.js";
import ContextMenuInteraction = Command.ContextMenuInteraction;

export class MemberValidationPrecondition extends Precondition {
  public async chatInputRun(interaction: CommandInteraction) {
    const target = interaction.options.getMember("member");
    return target != null ? this.ok() : this.error({ message: "Member not found." });
  }

  public async contextMenuRun(interaction: ContextMenuInteraction) {
    const message = interaction.options.getMessage("message");
    return message != null &&
      (await Try((interaction.guild as Guild).members.fetch(message.author.id)))
      ? this.ok()
      : this.error({ message: "Member not found." });
  }
}
