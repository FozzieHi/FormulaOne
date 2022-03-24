import { Precondition } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

export class MemberValidationPrecondition extends Precondition {
  public async chatInputRun(interaction: CommandInteraction) {
    const target = interaction.options.getMember("member");
    return target != null ? this.ok() : this.error({ message: "Member not found." });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    MemberValidation: never;
  }
}
