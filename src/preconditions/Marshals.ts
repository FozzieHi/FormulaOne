import { Precondition } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";
import { ModerationService } from "../services/ModerationService";

export class MarshalsPrecondition extends Precondition {
  public chatInputRun(interaction: CommandInteraction) {
    return ModerationService.getPermLevel(interaction.member as GuildMember) > 0
      ? this.ok()
      : this.error({ message: "You must be a Marshal in order to use this command." });
  }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        Marshals: never;
    }
}
