import { Precondition } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";
import { ModerationService } from "../services/ModerationService";

export class StewardsPrecondition extends Precondition {
  public chatInputRun(interaction: CommandInteraction) {
    return ModerationService.getPermLevel(interaction.member as GuildMember) > 1
      ? this.ok()
      : this.error({ message: "You must be a Steward in order to use this command." });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    Stewards: never;
  }
}
